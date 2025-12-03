import { useBroadcastEndMutation, useBroadcastNowMutation } from "@/services/meetingApi";
import { DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast, startBroadcast } from "../Broadcast/broadcastSlice";

export default function BroadcastNowButton({refresh}: {refresh: () => void}): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const isEnabled: boolean = useSelector((state: RootState) => state.broadcast.isBroadcasting);
    const [broadcastNow] = useBroadcastNowMutation();
    const [broadcastEnd] = useBroadcastEndMutation();

    // Animation values for the glow effect
    const glowOpacity = useSharedValue(0);
    const glowScale = useSharedValue(1);

    // Start/stop glow animation based on isEnabled state
    useEffect(() => {
        if (isEnabled) {
            // Pulse animation for glow when enabled
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 1000 }),
                    withTiming(0, { duration: 1000 })
                ),
                -1, // Repeat indefinitely
                false
            );
            glowScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                false
            );
        } else {
            // Reset to no glow when disabled
            glowOpacity.value = withTiming(0, { duration: 300 });
            glowScale.value = withTiming(1, { duration: 300 });
        }
    }, [isEnabled]);

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    const handleToggle = async () => {
        const newValue = !isEnabled;
        if (newValue) {
            dispatch(startBroadcast());
            try {
                await broadcastNow({ userId });
            } catch (error) {
                console.error("Error broadcasting:", error);
                dispatch(endBroadcast());
            }
        } else {
            dispatch(endBroadcast());
            try {
                await broadcastEnd({ userId });
            } catch (error) {
                console.error("Error ending broadcast:", error);
            }
        }
        refresh();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Find someone to talk to now</Text>
            <TouchableOpacity
                onPress={handleToggle}
                activeOpacity={0.7}
                style={styles.buttonContainer}
            >
                {/* Animated glow effect behind the button */}
                <Animated.View style={[styles.glow, animatedGlowStyle]} />

                {/* The actual button */}
                <View style={[styles.button, isEnabled && styles.buttonActive]}>
                    <Text style={[styles.buttonText, isEnabled && styles.buttonTextActive]}>
                        {isEnabled ? 'ON' : 'OFF'}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    label: {
        color: DARK_GREEN,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    loader: {
        marginRight: 8,
    },
    buttonContainer: {
        position: 'relative',
        width: 60,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        width: 70,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#ff4444',
        shadowColor: '#ff0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 10,
    },
    button: {
        width: 60,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#999',
    },
    buttonActive: {
        backgroundColor: '#ff4444',
        borderColor: '#ff0000',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
    },
    buttonTextActive: {
        color: '#fff',
    },
});

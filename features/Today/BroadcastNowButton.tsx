import BirdSoaring from '@/assets/images/bird-soaring.svg';
import { useBroadcastEndMutation, useBroadcastNowMutation } from "@/services/meetingApi";
import { DARK_GREEN, ORANGE, PEACH } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast, startBroadcast } from "../Broadcast/broadcastSlice";

// Create an animated version of the SVG component
const AnimatedBirdSoaring = Animated.createAnimatedComponent(BirdSoaring);

export default function BroadcastNowButton(): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const isEnabled: boolean = useSelector((state: RootState) => state.broadcast.isBroadcasting);
    const [broadcastNow] = useBroadcastNowMutation();
    const [broadcastEnd] = useBroadcastEndMutation();

    // Animation values for the glow effect
    const glowOpacity = useSharedValue(0);
    const glowScale = useSharedValue(1);

    // Animation value for color (0 = disabled color, 1 = enabled color)
    const colorProgress = useSharedValue(0);

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
                false// does not reverse
            );
            glowScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                false
            );
            // Animate color to enabled state - smooth back and forth
            colorProgress.value = withRepeat(
                withTiming(1, { duration: 1000 }),
                -1,
                true // reverse = true makes it go back and forth smoothly
            );
        } else {
            // Reset to no glow when disabled
            glowOpacity.value = withTiming(0, { duration: 300 });
            glowScale.value = withTiming(1, { duration: 300 });
            colorProgress.value = withTiming(0, { duration: 300 });
        }
    }, [isEnabled]);

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    const animatedBirdProps = useAnimatedProps(() => ({
        color: interpolateColor(
            colorProgress.value,
            [0, 1],
            [ORANGE, PEACH] // Smoothly transitions back and forth between ORANGE and PEACH
        ),
    }));

    const handleToggle = async () => {
        const newValue = !isEnabled;
        if (newValue) {
            dispatch(startBroadcast());
            try {
                await broadcastNow({ userId });
                // RTK Query will auto-refresh via cache invalidation
            } catch (error) {
                console.error("Error broadcasting:", error);
                dispatch(endBroadcast());
            }
        } else {
            dispatch(endBroadcast());
            try {
                await broadcastEnd({ userId });
                // RTK Query will auto-refresh via cache invalidation
            } catch (error) {
                console.error("Error ending broadcast:", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>I'm free for a call</Text>
            <TouchableOpacity
                onPress={handleToggle}
                activeOpacity={0.7}
                style={styles.buttonContainer}
            >
                {/* Animated glow effect behind the button */}
                <Animated.View style={[styles.glow, animatedGlowStyle]} />

                {/* The actual button */}
                <View style={[styles.button, isEnabled && styles.buttonActive]}>
                    <AnimatedBirdSoaring
                        animatedProps={animatedBirdProps}
                    />
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
        backgroundColor: PEACH,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 10,
    },
    button: {
        width: 60,
        height: 36,
        borderRadius: 18,
        //backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 2,
        // borderColor: '#999',
    },
    buttonActive: {
        // backgroundColor: CREAM,
        borderColor: PEACH,
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

import AnimatedText from "@/components/AnimatedText";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { startBroadcast } from "@/features/Broadcast/broadcastSlice";
import { useBroadcastNowMutation } from "@/services/meetingApi";
import { CHOCOLATE_COLOR, ORANGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

export default function BroadcastNowCard(): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [broadcastNow] = useBroadcastNowMutation();
    const [isStarting, setIsStarting] = useState(false);

    // Pulse animation for loading state (Option A)
    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (isStarting) {
            // Start subtle pulse when loading
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1,
                false
            );
        } else {
            // Reset to normal
            pulseOpacity.value = withTiming(1, { duration: 300 });
        }
    }, [isStarting]);

    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value
    }));

    const handleStartBroadcast = async () => {
        try {
            setIsStarting(true);
            // Wait for API to succeed before updating Redux
            await broadcastNow({ userId }).unwrap();
            // Now update Redux state
            dispatch(startBroadcast());
            // RTK Query will auto-refresh via cache invalidation
            // The card will disappear and be replaced by SelfBroadcastCard
        } catch (error) {
            console.error("Error starting broadcast:", error);
            alert('Failed to start broadcast. Please try again.');
            setIsStarting(false);
        }
    };

    return (
        <Animated.View style={[styles.container, animatedCardStyle]}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    {/* Option B: Change title when loading */}
                    {isStarting ? (
                        <>
                            <Text style={styles.titleText}>Starting broadcast</Text>
                            <AnimatedText
                                text="..."
                                style={{ fontSize: 20, fontFamily: CustomFonts.ztnaturebold, color: ORANGE }}
                                duration={300}
                                staggerDelay={500}
                            />
                        </>
                    ) : (
                        <Text style={styles.titleText}>
                            Invite calls now
                        </Text>
                    )}
                </View>
                <View>
                    <TouchableOpacity
                        onPress={handleStartBroadcast}
                        style={[styles.startButton, isStarting && styles.startButtonDisabled]}
                        disabled={isStarting}
                    >
                        {isStarting ? (
                            <ActivityIndicator size="small" color={ORANGE} />
                        ) : (
                            <Text style={styles.startButtonText}>Start broadcast</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            {!isStarting && (
                <View>
                    <Text style={styles.descriptionText}>
                        Anyone can claim your call and reach out.
                    </Text>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: PALE_BLUE,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    titleContainer: {
        flexDirection: 'row',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        fontFamily: CustomFonts.ztnaturebold,
    },
    titleText: {
        fontSize: 20,
        fontWeight: '600',
        color: ORANGE,
        fontFamily: CustomFonts.ztnaturebold,
    },
    descriptionText: {
        fontSize: 14,
        color: ORANGE,
        fontFamily: CustomFonts.ztnatureregular,
        opacity: 0.8,
    },
    startButton: {
        minWidth: 50,
        alignItems: 'center',
    },
    startButtonDisabled: {
        opacity: 0.6,
    },
    startButtonText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
});

import { eventCardText } from "@/constants/event_card_strings";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptSuggestionMutation, useDismissSuggestionMutation } from "@/services/meetingApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CHOCOLATE_COLOR, CORNFLOWER_BLUE, LAVENDER, ORANGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayDateTime, displayTimeDifference } from "../Meetings/meetingsUtils";
import type { ProcessedMeetingType } from "../Meetings/types";

interface DraftMeetingCardProps {
    meeting: ProcessedMeetingType;
}

const SWIPE_THRESHOLD = 50; // pixels to trigger the action
const MAX_SWIPE_DISTANCE = 70; // maximum swipe distance in pixels

export default function DraftMeetingCard({ meeting }: DraftMeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [acceptSuggestion] = useAcceptSuggestionMutation();
    const [dismissSuggestion] = useDismissSuggestionMutation();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);
    const translateX = useSharedValue(0);

    // Track which time is currently selected (index in backupScheduledTimes, or -1 for original)
    const [selectedTimeIndex, setSelectedTimeIndex] = useState(-1);

    // Track formatted display time for the currently selected time
    const [currentDisplayTime, setCurrentDisplayTime] = useState(meeting.displayScheduledFor);

    // Pulse and glow animation for time text (triggered on time change)
    const pulseScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    console.log("IN DRAFT MEETING ---", meeting);

    // Format the display time and trigger animation whenever the selected time changes
    useEffect(() => {
        const formatDisplayTime = async () => {
            const currentTime = getCurrentScheduledTime();
            if (selectedTimeIndex === -1) {
                setCurrentDisplayTime(meeting.displayScheduledFor);
            } else {
                const formatted = await displayDateTime(currentTime);
                setCurrentDisplayTime(formatted);
            }
        };
        formatDisplayTime();

        // Trigger pulse and glow animation when time changes (but not on initial mount)
        if (selectedTimeIndex !== -1 || meeting.backupScheduledTimes) {
            // Scale pulse
            pulseScale.value = withSequence(
                withTiming(1.15, { duration: 200, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
            );

            // Glow effect
            glowOpacity.value = withSequence(
                withTiming(0.8, { duration: 200, easing: Easing.out(Easing.ease) }),
                withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
            );
        }
    }, [selectedTimeIndex]);

    // Get the currently selected time
    const getCurrentScheduledTime = () => {
        if (selectedTimeIndex === -1 || !meeting.backupScheduledTimes || meeting.backupScheduledTimes.length === 0) {
            return meeting.scheduledFor;
        }
        return meeting.backupScheduledTimes[selectedTimeIndex];
    };

    // Get total number of available times (original + backups)
    const getTotalTimesCount = () => {
        return 1 + (meeting.backupScheduledTimes?.length || 0);
    };
    const handleAcceptSuggestion = async () => {
        try {
            setIsAccepting(true);

            // Get the currently selected time
            const selectedTime = getCurrentScheduledTime();

            // Optimistic update FIRST - remove from UI immediately
            dispatch(deleteMeetingOptimistic(meeting.id));

            try {
                await acceptSuggestion({
                    meetingId: meeting.id,
                    userId,
                    scheduledFor: selectedTime // Send the selected time
                }).unwrap();
                // Success - optimistic update already applied
                setIsAccepting(false);
            } catch (apiError) {
                // ROLLBACK - restore the meeting to UI
                dispatch(addMeetingRollback(meeting));
                throw apiError;
            }

        } catch (error) {
            console.error("Error accepting suggestion:", error);
            alert('Failed to accept suggestion. The item has been restored.');
            setIsAccepting(false);
        }
    };

    const handleDismissSuggestion = async () => {
        try {
            setIsDismissing(true);

            // Optimistic update FIRST - remove from UI immediately
            dispatch(deleteMeetingOptimistic(meeting.id));

            try {
                await dismissSuggestion({
                    meetingId: meeting.id,
                    userId
                }).unwrap();
                // Success - optimistic update already applied
                setIsDismissing(false);
            } catch (apiError) {
                // ROLLBACK - restore the meeting to UI
                dispatch(addMeetingRollback(meeting));
                throw apiError;
            }

        } catch (error) {
            console.error("Error dismissing suggestion:", error);
            alert('Failed to dismiss suggestion. The item has been restored.');
            setIsDismissing(false);
        }
    };

    // Get the name from the meeting
    const getFromName = () => {
        return meeting.targetUser.name || 'someone';
    };

    const strings = eventCardText.draft_suggestion;

    // Function to cycle to the next time
    const cycleToNextTime = () => {
        setSelectedTimeIndex((prevIndex) => {
            // Cycle through: -1 (original) -> 0 -> 1 -> ... -> length-1 -> -1 (back to original)
            const nextIndex = prevIndex + 1;
            if (nextIndex >= (meeting.backupScheduledTimes?.length || 0)) {
                return -1; // Back to original
            }
            return nextIndex;
        });
    };

    // Gesture handler for swipe-to-cycle-times
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            // Only allow right swipe up to MAX_SWIPE_DISTANCE
            translateX.value = Math.max(0, Math.min(MAX_SWIPE_DISTANCE, e.translationX));
        })
        .onEnd((e) => {
            if (e.translationX > SWIPE_THRESHOLD) {
                // Swipe completed - cycle to next time and bounce back quickly
                runOnJS(cycleToNextTime)();
                // Bounce back to original position with snappy spring
                translateX.value = withSpring(0, {
                    damping: 20,
                    stiffness: 300
                });
            } else {
                // Snap back to original position quickly
                translateX.value = withSpring(0, {
                    damping: 20,
                    stiffness: 300
                });
            }
        });

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: 1 - (translateX.value / MAX_SWIPE_DISTANCE) * 0.3, // Fade slightly as it moves
    }));

    const animatedPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        shadowColor: BRIGHT_BLUE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowOpacity.value,
        shadowRadius: 10,
        elevation: glowOpacity.value * 10, // For Android
    }));

    return (
        <View style={styles.outerContainer}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.container, animatedCardStyle]}>
                    <View style={styles.header}>
                        <Text style={styles.nameText}>{strings.nameText!(getFromName())}</Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={handleAcceptSuggestion}
                                style={styles.acceptButton}
                                disabled={isAccepting}
                            >
                                {isAccepting ? (
                                    <ActivityIndicator size="small" color="green" />
                                ) : (
                                    <Text style={styles.acceptButtonText}>{strings.acceptButtonText!()}</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDismissSuggestion}
                                style={styles.dismissButton}
                                disabled={isDismissing}
                            >
                                {isDismissing ? (
                                    <ActivityIndicator size="small" color="red" />
                                ) : (
                                    <Text style={styles.dismissButtonText}>{strings.rejectButtonText!()}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.mainText}>{strings.mainText!(getFromName(), displayTimeDifference(getCurrentScheduledTime()))}</Text>

                    <Animated.View style={[animatedPulseStyle]}>
                        <Text style={styles.timeText}>{currentDisplayTime}</Text>
                    </Animated.View>

                    {DEV_FLAG && (
                        <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)} (DRAFT) - Time {selectedTimeIndex + 1}/{getTotalTimesCount()}</Text>
                    )}
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: CARD_LOWER_MARGIN,
    },
    container: {
        borderRadius: 8,
        padding: 12,
        backgroundColor: LAVENDER,
        minHeight: CARD_MIN_HEIGHT,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameText: {
        fontSize: 20,
        fontWeight: '600',
        color: ORANGE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnaturebold,
    },
    mainText: {
        fontSize: 14,
        fontWeight: '600',
        color: CORNFLOWER_BLUE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnatureregular,
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: BRIGHT_BLUE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptButton: {
        borderRadius: 4,
    },
    acceptButtonText: {
        color: BRIGHT_GREEN,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    dismissButton: {
        borderRadius: 4,
    },
    dismissButtonText: {
        fontSize: 12,
        color: CHOCOLATE_COLOR,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
});

import { eventCardText } from "@/constants/event_card_strings";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptSuggestionMutation, useDismissSuggestionMutation } from "@/services/meetingApi";
import { BOLD_BLUE, BOLD_BROWN, BURGUNDY, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
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
    const [isInitialMount, setIsInitialMount] = useState(true);

    // Track formatted display time for the currently selected time
    const [currentDisplayTime, setCurrentDisplayTime] = useState(meeting.displayScheduledFor);

    // Slide animation for time text (triggered on time change)
    const timeTranslateX = useSharedValue(0);
    const timeOpacity = useSharedValue(1);

    // First-time instruction state and animation
    const [showInstruction, setShowInstruction] = useState(false);
    const instructionOpacity = useSharedValue(0);
    const instructionTranslateY = useSharedValue(10);

    console.log("IN DRAFT MEETING ---", meeting);

    // Check if this is the first time viewing a draft meeting card
    useEffect(() => {
        const checkFirstTime = async () => {
            try {
                const hasSeenSwipeInstruction = await AsyncStorage.getItem('hasSeenDraftSwipeInstruction');
                if (!hasSeenSwipeInstruction && meeting.backupScheduledTimes && meeting.backupScheduledTimes.length > 0) {
                    setShowInstruction(true);
                    // Fade in instruction
                    instructionOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
                    instructionTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
                }
            } catch (error) {
                console.error('Error checking first time instruction:', error);
            }
        };
        checkFirstTime();
    }, [meeting.id]);

    // Format the display time and trigger animation whenever the selected time changes
    useEffect(() => {
        const formatDisplayTime = async () => {
            const currentTime = getCurrentScheduledTime();

            // Only animate if this is NOT the initial mount
            if (!isInitialMount) {
                // Slide out to the right and fade out
                timeTranslateX.value = withTiming(30, { duration: 150, easing: Easing.out(Easing.ease) });
                timeOpacity.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.ease) });

                // Wait for slide out to complete, then update text and slide in from left
                setTimeout(async () => {
                    // Update the text content
                    if (selectedTimeIndex === -1) {
                        setCurrentDisplayTime(meeting.displayScheduledFor);
                    } else {
                        const formatted = await displayDateTime(currentTime);
                        setCurrentDisplayTime(formatted);
                    }

                    // Reset position to left (off-screen) - set directly without animation
                    timeTranslateX.value = -30;

                    // Small delay to ensure state update, then slide in from left
                    setTimeout(() => {
                        timeTranslateX.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
                        timeOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
                    }, 50);
                }, 150);
            } else {
                // Initial mount - no animation, just set the text
                if (selectedTimeIndex === -1) {
                    setCurrentDisplayTime(meeting.displayScheduledFor);
                } else {
                    const formatted = await displayDateTime(currentTime);
                    setCurrentDisplayTime(formatted);
                }
                setIsInitialMount(false);
            }
        };
        formatDisplayTime();
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

    // Function to dismiss instruction
    const dismissInstruction = async () => {
        // Fade out instruction
        instructionOpacity.value = withTiming(0, { duration: 400 });
        instructionTranslateY.value = withTiming(-10, { duration: 400 });

        setTimeout(() => {
            setShowInstruction(false);
        }, 400);

        // Mark as seen in storage
        try {
            await AsyncStorage.setItem('hasSeenDraftSwipeInstruction', 'true');
        } catch (error) {
            console.error('Error saving instruction state:', error);
        }
    };

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

        // Dismiss instruction on first swipe
        if (showInstruction) {
            dismissInstruction();
        }
    };

    // Gesture handler for swipe-to-cycle-times
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            // Only allow right swipe up to MAX_SWIPE_DISTANCE
            translateX.value = Math.max(0, Math.min(MAX_SWIPE_DISTANCE, e.translationX));
        })
        .onEnd((e) => {
            if (e.translationX > SWIPE_THRESHOLD) {
                // Swipe completed - cycle to next time and slide back smoothly
                runOnJS(cycleToNextTime)();
                // Slide back to original position with slight deceleration
                translateX.value = withTiming(0, {
                    duration: 200,
                    easing: Easing.out(Easing.ease)
                });
            } else {
                // Slide back to original position with slight deceleration
                translateX.value = withTiming(0, {
                    duration: 200,
                    easing: Easing.out(Easing.ease)
                });
            }
        });

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: 1 - (translateX.value / MAX_SWIPE_DISTANCE) * 0.3, // Fade slightly as it moves
    }));

    const animatedPulseStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: timeTranslateX.value }],
        opacity: timeOpacity.value,
    }));

    const animatedInstructionStyle = useAnimatedStyle(() => ({
        opacity: instructionOpacity.value,
        transform: [{ translateY: instructionTranslateY.value }],
    }));

    return (
        <View style={styles.outerContainer}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.container, animatedCardStyle]}>
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.titleText}>{strings.nameText!(getFromName())}</Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={handleDismissSuggestion}
                                style={[styles.dismissButton, isDismissing && styles.buttonDisabled]}
                                disabled={isDismissing}
                            >
                                {isDismissing ? (
                                    <ActivityIndicator size="small" color={PALE_BLUE} />
                                ) : (
                                    <Text style={styles.dismissButtonText}>{strings.rejectButtonText!()}</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAcceptSuggestion}
                                style={[styles.acceptButton, isAccepting && styles.buttonDisabled]}
                                disabled={isAccepting}
                            >
                                {isAccepting ? (
                                    <ActivityIndicator size="small" color={PALE_BLUE} />
                                ) : (
                                    <Text style={styles.acceptButtonText}>{strings.acceptButtonText!()}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View>
                        <Text style={styles.mainText}>{strings.mainText!(getFromName(), displayTimeDifference(getCurrentScheduledTime()))}</Text>
                        <Animated.View style={[animatedPulseStyle]}>
                            <Text style={styles.timeText}>{currentDisplayTime}</Text>
                        </Animated.View>
                    </View>

                    {/* Right-edge gradient overlay with arrow (Option 3) - only show if there are backup times */}
                    {meeting.backupScheduledTimes && meeting.backupScheduledTimes.length > 0 && (
                        <View style={styles.gradientOverlay}>
                            <Text style={styles.arrowText}>→</Text>
                        </View>
                    )}

                    {/* First-time instructional text (Option 4) */}
                    {showInstruction && (
                        <Animated.View style={[styles.instructionContainer, animatedInstructionStyle]}>
                            <TouchableOpacity onPress={dismissInstruction} activeOpacity={0.8}>
                                <Text style={styles.instructionText}>Swipe for other times →</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

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
        backgroundColor: BOLD_BLUE,
        borderRadius: 8,
        padding: 20,
        minHeight: CARD_MIN_HEIGHT,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleContainer: {
        flex: 1,
    },
    titleText: {
        fontSize: 28,
        fontWeight: '600',
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
    },
    mainText: {
        fontSize: 14,
        color: CREAM,
        fontFamily: CustomFonts.ztnatureregular,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 20,
        fontWeight: '600',
        color: BOLD_BROWN,
        fontFamily: CustomFonts.ztnaturemedium,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: BURGUNDY,
        borderRadius: 15,
        paddingVertical: 8,
        paddingHorizontal: 14,
        minWidth: 60,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: PALE_BLUE,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    dismissButton: {
        backgroundColor: BURGUNDY,
        borderRadius: 15,
        paddingVertical: 8,
        paddingHorizontal: 14,
        minWidth: 60,
        alignItems: 'center',
    },
    dismissButtonText: {
        fontSize: 12,
        color: PALE_BLUE,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    gradientOverlay: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    arrowText: {
        fontSize: 24,
        color: BOLD_BROWN,
        opacity: 0.4,
        fontFamily: CustomFonts.ztnaturemedium,
    },
    instructionContainer: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    instructionText: {
        fontSize: 13,
        color: BOLD_BROWN,
        fontFamily: CustomFonts.ztnaturemedium,
        opacity: 0.8,
    },
});

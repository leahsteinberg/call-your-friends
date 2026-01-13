import { EventCard } from "@/components/EventCard/EventCard";
import InlineTimePicker from "@/components/Pickers/InlineTimePicker";
import TimePickerModal from "@/components/Pickers/TimePickerModal";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptSuggestionMutation, useDismissSuggestionMutation } from "@/services/meetingApi";
import { BOLD_BLUE, BOLD_BROWN, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayDateTime, displayTimeDifference } from "../Meetings/meetingsUtils";
import type { ProcessedMeetingType } from "../Meetings/types";

interface DraftMeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function DraftMeetingCard({ meeting }: DraftMeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [acceptSuggestion] = useAcceptSuggestionMutation();
    const [dismissSuggestion] = useDismissSuggestionMutation();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);
    const [showTimePickerModal, setShowTimePickerModal] = useState(false);

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

    // Get the name from the meeting - handles both single and multiple target users
    const getFromName = () => {
        // Try new multi-user field first
        if (meeting.targetUsers && meeting.targetUsers.length > 0) {
            return meeting.targetUsers[0].name
        }
        // Fallback to single targetUser for backwards compatibility
        return meeting.targetUser?.name || 'someone';
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

    const animatedPulseStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: timeTranslateX.value }],
        opacity: timeOpacity.value,
    }));

    const animatedInstructionStyle = useAnimatedStyle(() => ({
        opacity: instructionOpacity.value,
        transform: [{ translateY: instructionTranslateY.value }],
    }));

    return (
        <EventCard
            backgroundColor={BOLD_BLUE}
            // gesture={(props) => (
            //     <RightSwipe onSwipeComplete={cycleToNextTime}>
            //         {props.children}
            //     </RightSwipe>
            // )}
        >
            <EventCard.Header spacing="between" align="center">
                <EventCard.Title>{strings.nameText!(getFromName())}</EventCard.Title>

                <EventCard.Actions layout="horizontal" spacing={8}>
                    <EventCard.Button
                        onPress={handleDismissSuggestion}
                        loading={isDismissing}
                        variant="danger"
                        size="small"
                    >
                        <Text style={styles.dismissButtonText}>
                            {strings.rejectButtonText!()}
                        </Text>
                    </EventCard.Button>

                    <EventCard.Button
                        onPress={handleAcceptSuggestion}
                        loading={isAccepting}
                        variant="danger"
                        size="small"
                    >
                        <Text style={styles.acceptButtonText}>
                            {strings.acceptButtonText!()}
                        </Text>
                    </EventCard.Button>
                </EventCard.Actions>
            </EventCard.Header>

            <EventCard.Body>
                <Text style={styles.mainText}>
                    {strings.mainText!(getFromName(), displayTimeDifference(getCurrentScheduledTime()))}
                </Text>

                {/* Custom animated time carousel */}
                <Animated.View style={[animatedPulseStyle]}>
                    <Text style={styles.timeText}>{currentDisplayTime}</Text>
                </Animated.View>

                {/* Inline Time Picker */}
                <InlineTimePicker
                    onTimeChange={(day, timeOfDay) => {
                        console.log('Selected time:', day, timeOfDay);
                        // TODO: Handle the selected time
                    }}
                />

                {/* First-time instructional text */}
                {showInstruction && (
                    <Animated.View style={[styles.instructionContainer, animatedInstructionStyle]}>
                        <TouchableOpacity onPress={dismissInstruction} activeOpacity={0.8}>
                            <Text style={styles.instructionText}>Swipe for other times →</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Propose Different Time Button */}
                <TouchableOpacity
                    style={styles.proposeTimeButton}
                    onPress={() => setShowTimePickerModal(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.proposeTimeButtonText}>Propose Different Time</Text>
                </TouchableOpacity>

                {DEV_FLAG && (
                    <Text style={styles.debugText}>
                        ID: {meeting.id.substring(0, 4)} (DRAFT) - Time {selectedTimeIndex + 1}/{getTotalTimesCount()}
                    </Text>
                )}
            </EventCard.Body>

            {/* Time Picker Modal */}
            <TimePickerModal
                visible={showTimePickerModal}
                onClose={() => setShowTimePickerModal(false)}
                onConfirm={(day, timeOfDay) => {
                    console.log('Selected time:', day, timeOfDay);
                    // TODO: Handle the selected time
                }}
            />

            {/* Right-edge arrow decoration - only show if there are backup times */}
            {meeting.backupScheduledTimes && meeting.backupScheduledTimes.length > 0 && (
                <EventCard.Decoration position="right-edge">
                    <Text style={styles.arrowText}>→</Text>
                </EventCard.Decoration>
            )}
        </EventCard>
    );
}

const styles = StyleSheet.create({
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
    acceptButtonText: {
        color: PALE_BLUE,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    dismissButtonText: {
        fontSize: 12,
        color: PALE_BLUE,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
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
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    proposeTimeButton: {
        backgroundColor: PALE_BLUE,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: BOLD_BLUE,
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    proposeTimeButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
    },
});

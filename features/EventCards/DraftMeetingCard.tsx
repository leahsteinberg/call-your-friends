import { eventCardText } from "@/constants/event_card_strings";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptSuggestionMutation, useDismissSuggestionMutation } from "@/services/meetingApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CHOCOLATE_COLOR, CORNFLOWER_BLUE, LAVENDER, ORANGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { ProcessedMeetingType } from "../Meetings/types";

interface DraftMeetingCardProps {
    meeting: ProcessedMeetingType;
    onSuggestLater?: () => void;
}

const SWIPE_THRESHOLD = 50; // pixels to trigger the action
const MAX_SWIPE_DISTANCE = 70; // maximum swipe distance in pixels

export default function DraftMeetingCard({ meeting, onSuggestLater }: DraftMeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [acceptSuggestion] = useAcceptSuggestionMutation();
    const [dismissSuggestion] = useDismissSuggestionMutation();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);
    const translateX = useSharedValue(0);

    console.log("IN DRAFT MEETING ---", meeting);
    const handleAcceptSuggestion = async () => {
        try {
            setIsAccepting(true);

            // Optimistic update FIRST - remove from UI immediately
            dispatch(deleteMeetingOptimistic(meeting.id));

            try {
                await acceptSuggestion({
                    meetingId: meeting.id,
                    userId
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

    // Gesture handler for swipe-to-suggest-later
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            // Only allow right swipe up to MAX_SWIPE_DISTANCE
            translateX.value = Math.max(0, Math.min(MAX_SWIPE_DISTANCE, e.translationX));
        })
        .onEnd((e) => {
            if (e.translationX > SWIPE_THRESHOLD) {
                // Swipe completed - trigger callback and bounce back quickly
                if (onSuggestLater) {
                    runOnJS(onSuggestLater)();
                }
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
                    <Text style={styles.mainText}>{strings.mainText!(getFromName(), displayTimeDifference(meeting.scheduledFor))}</Text>

                    <Text style={styles.timeText}>{getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}</Text>

                    {DEV_FLAG && (
                        <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)} (DRAFT)</Text>
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

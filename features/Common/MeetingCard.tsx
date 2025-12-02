import { DEV_FLAG } from "@/environment";
import { endBroadcast } from "@/features/Broadcast/broadcastSlice";
import { useCancelBroadcastAcceptanceMutation, useDeleteMeetingMutation } from "@/services/meetingApi";
import { BRIGHT_BLUE, CREAM, DARK_BEIGE, DARK_GREEN, ORANGE } from "@/styles/styles";
import { ACCEPTED_MEETING_STATE, PAST_MEETING_STATE, REJECTED_MEETING_STATE, SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface MeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function MeetingCard({ meeting }: MeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const userName: string | undefined = useSelector((state: RootState) => state.auth.user.name);
    const [deleteMeeting] = useDeleteMeetingMutation();
    const [cancelBroadcastAcceptance] = useCancelBroadcastAcceptanceMutation();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    const meetingState: MeetingState  = meeting.meetingState;
    const selfCreatedMeeting = meeting.userFromId === userId;

    // Check if meeting is PAST and started more than 30 minutes ago
    const isOldPastMeeting = () => {
        if (meetingState !== 'PAST') return false;
        const scheduledTime = new Date(meeting.scheduledFor).getTime();
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        return scheduledTime < thirtyMinutesAgo;
    };

    // Get the name to display based on who created the meeting
    const getNameDisplay = () => {
        if (selfCreatedMeeting) {
            if (meeting.acceptedUser) {
                const name = meeting.acceptedUser?.name;
                return name ? `with: ${name}` : null;
            } else {
                return 'from: me!'
            }
        }
        const name = meeting.userFrom?.name;
        return name ? `from: ${name}` : null;
    };

    const handleDeleteMeeting = async () => {
        try {
            setIsDeleting(true);
            await deleteMeeting({
                meetingId: meeting.id,
                userId
            }).unwrap();

            // Remove from Redux after successful deletion
            dispatch(deleteMeetingOptimistic(meeting.id));

            // If this is a self-created broadcast meeting, turn off the broadcast toggle
            if (selfCreatedMeeting && meeting.meetingType === 'BROADCAST') {
                dispatch(endBroadcast());
            }
        } catch (error) {
            console.error("Error deleting meeting:", error);
            alert('Failed to delete meeting. Please try again.');
            setIsDeleting(false);
        }
    };

    const handleCancelBroadcastAcceptance = async () => {
        try {
            setIsCanceling(true);
            await cancelBroadcastAcceptance({
                meetingId: meeting.id,
                userId
            }).unwrap();

            // Remove from Redux after successful cancellation
            dispatch(deleteMeetingOptimistic(meeting.id));
        } catch (error) {
            console.error("Error canceling broadcast acceptance:", error);
            alert('Failed to cancel acceptance. Please try again.');
            setIsCanceling(false);
        }
    };

    const getStatusText = () => {
        switch (meetingState) {
            case SEARCHING_MEETING_STATE:
                return 'Searching';
            case ACCEPTED_MEETING_STATE:
                return 'Confirmed';
            case REJECTED_MEETING_STATE:
                return 'Rejected';
            case PAST_MEETING_STATE:
                return 'Past';
            default:
                return meetingState;
        }
    };

    const nameDisplay = getNameDisplay();

    return (
        <View style={[styles.container, isOldPastMeeting() && styles.oldPastContainer]}>
            <View style={styles.header}>
                <View style={styles.typeIndicatorContainer}>
                    <View style={styles.typeIndicator}>
                        <Text style={styles.typeText}>Meeting</Text>
                    </View>
                    {meeting.meetingType === 'BROADCAST' && (
                        <View style={styles.broadcastIndicator}>
                            <Text style={styles.broadcastText}>BROADCAST</Text>
                        </View>
                    )}
                </View>

                {/* Show "Cancel Acceptance" for broadcast meetings not created by user */}
                {meeting.meetingType === 'BROADCAST' && !selfCreatedMeeting ? (
                    <TouchableOpacity
                        onPress={handleCancelBroadcastAcceptance}
                        style={[styles.cancelButton, isCanceling && styles.cancelButtonDisabled]}
                        disabled={isCanceling}
                    >
                        {isCanceling ? (
                            <ActivityIndicator size="small" color="orange" />
                        ) : (
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleDeleteMeeting}
                        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="red" />
                        ) : (
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.timeText}>{getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}</Text>

            {nameDisplay && (
                <Text style={styles.nameText}>{nameDisplay}</Text>
            )}

            <Text style={styles.statusText}>Status: {getStatusText()}</Text>
            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: CREAM,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: DARK_BEIGE,
    },
    oldPastContainer: {
        backgroundColor: '#E8E8E8',
        opacity: 0.7,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeIndicatorContainer: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    typeIndicator: {
        backgroundColor: DARK_GREEN,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    broadcastIndicator: {
        backgroundColor: '#5a7d9a',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    broadcastText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
    },
    typeText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: BRIGHT_BLUE,
        marginBottom: 4,
    },
    nameText: {
        fontSize: 14,
        fontWeight: '600',
        color: ORANGE,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: 'monospace',
    },
    deleteButton: {
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 50,
        alignItems: 'center',
    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: 'red',
        fontSize: 12,
        fontWeight: '600',
    },
   cancelButton: {
        borderWidth: 1,
        borderColor: ORANGE,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 50,
        alignItems: 'center'
    },
    cancelButtonDisabled: {
        opacity: 0.
    },
    cancelButtonText: {
        color: ORANGE,
        fontSize: 12,
         fontWeight: '600',
    },
         });

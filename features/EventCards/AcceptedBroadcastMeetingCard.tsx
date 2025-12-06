import { DEV_FLAG } from "@/environment";
import { useCancelBroadcastAcceptanceMutation } from "@/services/meetingApi";
import { BRIGHT_BLUE, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { ACCEPTED_MEETING_STATE, PAST_MEETING_STATE, REJECTED_MEETING_STATE, SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface AcceptedBroadcastMeetingCardProps {
    meeting: ProcessedMeetingType;
}

// Card for broadcast meetings that the user accepted (not created)
export default function AcceptedBroadcastMeetingCard({ meeting }: AcceptedBroadcastMeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [cancelBroadcastAcceptance] = useCancelBroadcastAcceptanceMutation();
    const [isCanceling, setIsCanceling] = useState(false);

    const meetingState: MeetingState = meeting.meetingState;

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

    const getFromName = () => {
        return meeting.userFrom?.name || 'Unknown';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.typeIndicator}>
                    <Text style={styles.typeText}>📡 ACCEPTED BROADCAST</Text>
                </View>

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
            </View>

            <Text style={styles.timeText}>{getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}</Text>
            <Text style={styles.nameText}>with: {getFromName()}</Text>
            <Text style={styles.statusText}>Status: {getStatusText()}</Text>

            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: ORANGE,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: DARK_BEIGE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeIndicator: {
        backgroundColor: '#5a7d9a',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
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
        opacity: 0.6,
    },
    cancelButtonText: {
        color: ORANGE,
        fontSize: 12,
        fontWeight: '600',
    },
});

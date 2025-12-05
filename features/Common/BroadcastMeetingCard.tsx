import { DEV_FLAG } from "@/environment";
import { endBroadcast } from "@/features/Broadcast/broadcastSlice";
import { useDeleteMeetingMutation } from "@/services/meetingApi";
import { BRIGHT_GREEN, CREAM, DARK_GREEN } from "@/styles/styles";
import { ACCEPTED_MEETING_STATE, PAST_MEETING_STATE, REJECTED_MEETING_STATE, SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface BroadcastMeetingCardProps {
    meeting: ProcessedMeetingType;
}

// Card for self-created broadcast meetings
export default function BroadcastMeetingCard({ meeting }: BroadcastMeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [deleteMeeting] = useDeleteMeetingMutation();
    const [isDeleting, setIsDeleting] = useState(false);

    const meetingState: MeetingState = meeting.meetingState;

    // Get the name to display
    const getNameDisplay = () => {
        if (meeting.acceptedUser) {
            const name = meeting.acceptedUser?.name;
            return name ? `Matched with: ${name}` : 'Matched!';
        }
        return 'Searching for someone to talk...';
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

            // Turn off the broadcast toggle
            dispatch(endBroadcast());
        } catch (error) {
            console.error("Error deleting broadcast meeting:", error);
            alert('Failed to delete broadcast. Please try again.');
            setIsDeleting(false);
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
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.typeIndicator}>
                    <Text style={styles.typeText}>📡 YOUR BROADCAST</Text>
                </View>

                <TouchableOpacity
                    onPress={handleDeleteMeeting}
                    style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.deleteButtonText}>End</Text>
                    )}
                </TouchableOpacity>
            </View>

            <Text style={styles.nameText}>{nameDisplay}</Text>
            <Text style={styles.statusText}>Status: {getStatusText()}</Text>

            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: BRIGHT_GREEN,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: DARK_GREEN,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeIndicator: {
        backgroundColor: DARK_GREEN,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    typeText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: DARK_GREEN,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        color: DARK_GREEN,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: 'monospace',
    },
    deleteButton: {
        backgroundColor: DARK_GREEN,
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
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
    },
});

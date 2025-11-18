import { useDeleteMeetingMutation } from "@/services/meetingApi";
import { BRIGHT_BLUE, CREAM, DARK_BEIGE, DARK_GREEN, ORANGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedMeetingType, MeetingState } from "../Meetings/types";

interface MeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function MeetingCard({ meeting }: MeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [deleteMeeting] = useDeleteMeetingMutation();

    const meetingState: MeetingState = meeting.meetingState;
    const selfCreatedMeeting = meeting.userFromId === userId;

    // Get the name to display based on who created the meeting
    const getNameDisplay = () => {
        if (selfCreatedMeeting) {
            const name = meeting.acceptedUser?.name;
            return name ? `with: ${name}` : null;
        } else {
            const name = meeting.userFrom?.name;
            return name ? `from: ${name}` : null;
        }
    };

    const handleDeleteMeeting = async () => {
        try {
            // Optimistic deletion
            dispatch(deleteMeetingOptimistic(meeting.id));
            await deleteMeeting({
                meetingId: meeting.id,
                userId
            }).unwrap();
        } catch (error) {
            console.error("Error deleting meeting:", error);
            alert('Failed to delete meeting. Please try again.');
        }
    };

    const getStatusText = () => {
        switch (meetingState) {
            case 'SEARCHING':
                return 'Searching';
            case 'ACCEPTED':
                return 'Confirmed';
            case 'REJECTED':
                return 'Rejected';
            case 'PAST':
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
                    <Text style={styles.typeText}>Meeting</Text>
                </View>
                <TouchableOpacity
                    onPress={handleDeleteMeeting}
                    style={styles.deleteButton}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.timeText}>{getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}</Text>

            {nameDisplay && (
                <Text style={styles.nameText}>{nameDisplay}</Text>
            )}

            <Text style={styles.statusText}>Status: {getStatusText()}</Text>
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
    deleteButton: {
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    deleteButtonText: {
        color: 'red',
        fontSize: 12,
        fontWeight: '600',
    },
});

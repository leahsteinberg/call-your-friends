import AnimatedText from "@/components/AnimatedText";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { endBroadcast } from "@/features/Broadcast/broadcastSlice";
import { useDeleteMeetingMutation } from "@/services/meetingApi";
import { CHOCOLATE_COLOR, DARK_GREEN, ORANGE, PALE_BLUE } from "@/styles/styles";
import { ACCEPTED_MEETING_STATE, PAST_MEETING_STATE, REJECTED_MEETING_STATE, SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface SelfBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Card for self-created broadcast meetings
export default function SelfBroadcastCard({ meeting }: SelfBroadcastCardProps): React.JSX.Element {
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
        return 'Searching for someone to talk';
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
            <View style={styles.searchingContainer}>
                <Text style={styles.searchingText}>{eventCardText.broadcast_self_open.title()}</Text>
                <AnimatedText
                    text="..."
                    style={{ fontSize: 20, fontFamily: CustomFonts.ztnaturebold, color:ORANGE }}
                    duration={300}
                    staggerDelay={500}
                />
            </View>

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleDeleteMeeting}
                    style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.deleteButtonText}>End broadcast</Text>
                    )}
                </TouchableOpacity>
            </View>


            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: PALE_BLUE,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
        //borderWidth: 2,
        //borderColor: DARK_GREEN,
    },
    searchingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 8,
        fontFamily: CustomFonts.ztnaturebold,
    },
    searchingText: {
        fontSize: 20,
        fontWeight: '600',
        color: ORANGE,
        fontFamily: CustomFonts.ztnaturebold,
    },
    statusText: {
        fontSize: 14,
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturelight,

    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    deleteButton: {
        // backgroundColor: CREAM,
        // borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 50,
        alignItems: 'center',

    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,

    },
});

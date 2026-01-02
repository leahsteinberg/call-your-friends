import HighFiveStar from "@/assets/images/high-five-star.svg";
import { EventCard } from "@/components/EventCard/EventCard";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { CHOCOLATE_COLOR, CORNFLOWER_BLUE, ORANGE, PALE_BLUE } from "@/styles/styles";
import { ACCEPTED_MEETING_STATE, PAST_MEETING_STATE, REJECTED_MEETING_STATE, SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getTargetUserNames } from "@/utils/nameStringUtils";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface OtherMeetingBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Card for broadcast meetings that the user accepted (not created)
export default function OtherMeetingBroadcastCard({ meeting }: OtherMeetingBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [isCanceling, setIsCanceling] = useState(false);
    const [cancelMeeting] = useCancelMeetingMutation();

    const meetingState: MeetingState = meeting.meetingState;

    const handleCancelMeeting = async () => {
        try {
            setIsCanceling(true);

            // Optimistic update FIRST - remove from UI immediately
            dispatch(deleteMeetingOptimistic(meeting.id));

            try {
                const response = await cancelMeeting({
                    meetingId: meeting.id,
                    userId
                }).unwrap();
                console.log("response", response);
                // Success - optimistic update already applied
                setIsCanceling(false);
            } catch (apiError) {
                // ROLLBACK - restore the meeting to UI
                dispatch(addMeetingRollback(meeting));
                throw apiError;
            }

        } catch (error) {
            console.error("Error deleting meeting:", error);
            alert('Failed to delete meeting. The item has been restored.');
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

    // Helper to get target user names - handles both single and multiple target users
    const getTargetUserNames = () => {
        // Try new multi-user field first
        if (meeting.targetUsers && meeting.targetUsers.length > 0) {
            const names = meeting.targetUsers.map(user => user.name).filter(Boolean);
            if (names.length > 0) {
                return names.join(', ');
            }
        }
        // Fallback to single targetUser for backwards compatibility
        if (meeting.targetUserId && meeting.targetUser?.name) {
            return meeting.targetUser.name;
        }
        return null;
    };

    const targetUserName = getTargetUserNames();

    return (
        <EventCard backgroundColor={PALE_BLUE}>
            <EventCard.Header spacing="between" align="start">
                <EventCard.Title size="large" color={ORANGE}>
                    {getFromName()}
                    {targetUserName && ` → ${targetUserName}`}
                </EventCard.Title>

                <EventCard.Button
                    onPress={handleCancelMeeting}
                    loading={isCanceling}
                    variant="ghost"
                    size="small"
                >
                    <Text style={styles.cancelButtonText}>Unclaim Call</Text>
                </EventCard.Button>
            </EventCard.Header>

            <EventCard.Body>
                <Text style={styles.contentText}>You're on a call right now</Text>

                {/* High Five Animation */}
                <HighFiveStar fill={ORANGE} height={20} width={20} />

                {DEV_FLAG && (
                    <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
                )}
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    cancelButtonText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    contentText: {
        fontFamily: CustomFonts.ztnatureregular,
        color: CORNFLOWER_BLUE,
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});

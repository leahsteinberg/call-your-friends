import AnimatedText from "@/components/AnimationComponents/AnimatedText";
import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { CREAM, PALE_BLUE } from "@/styles/styles";
import { PAST_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getTargetUserNames } from "@/utils/nameStringUtils";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface MeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function MeetingCard({ meeting }: MeetingCardProps): React.JSX.Element {
    console.log("MEETING CARDF -,", meeting)
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const userName: string | undefined = useSelector((state: RootState) => state.auth.user.name);
    const [cancelMeeting] = useCancelMeetingMutation();
    const [isCanceling, setIsCanceling] = useState(false);

    const meetingState: MeetingState  = meeting.meetingState;
    const selfCreatedMeeting = meeting.userFromId === userId;

    // Check if meeting is PAST and started more than 30 minutes ago
    const isOldPastMeeting = () => {
        if (meetingState !== PAST_MEETING_STATE) return false;
        const scheduledTime = new Date(meeting.scheduledFor).getTime();
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        return scheduledTime < thirtyMinutesAgo;
    };


    const getOpenMeetingTitle = () => {
        return (
            <EventCard.Row gap={0}>
                <EventCard.Title>
                    {eventCardText.meeting_self_open.title()}{'\n'}
                    {displayTimeDifference(meeting.scheduledFor)}
                </EventCard.Title>
                <AnimatedText
                    text="..."
                    style={{ fontSize: 28, fontFamily: CustomFonts.ztnaturebold, color: CREAM, fontWeight: '600' }}
                    duration={300}
                    staggerDelay={500}
                    inline={true}
                />
            </EventCard.Row>
        );
    };

    const getClaimedSelfMeetingTitle = () => {
        console.log("hii getCLaimedddd")
        // Try new multi-user field first, fall back to single acceptedUser
        let name: string | undefined;
        if (meeting.acceptedUsers && meeting.acceptedUsers.length > 0) {
            const names = meeting.acceptedUsers.map(user => user.name).filter(Boolean);
            name = names.length > 0 ? names.join(', ') : undefined;
        } else {
            name = meeting.acceptedUser?.name;
        }
        return (
            <EventCard.Title>
                {eventCardText.meeting_self_accepted.title(name)}{displayTimeDifference(meeting.scheduledFor)}
            </EventCard.Title>
        );
    };

    const getMainDisplay = () => {
        if (selfCreatedMeeting) {
            // Check if meeting has been accepted - try new multi-user field first
            const hasAcceptedUsers = (meeting.acceptedUsers && meeting.acceptedUsers.length > 0) || meeting.acceptedUser;

            if (hasAcceptedUsers) {
                return getClaimedSelfMeetingTitle()
            } else {
                // Check if there are target users for open meetings
                const targetNames = getTargetUserNames(meeting);
                if (targetNames) {
                    return (
                        <EventCard.Title>
                            We'll see if {targetNames} is free in {displayTimeDifference(meeting.scheduledFor)}
                        </EventCard.Title>
                    );
                }
                return getOpenMeetingTitle();
            }
        }
        const name = meeting.userFrom?.name;
        const targetNames = getTargetUserNames(meeting);

        return (
            <EventCard.Title>
                {name ? `Accepted a meeting created by ${name}` : 'Accepted meeting'}
                {targetNames && ` → ${targetNames}`}
            </EventCard.Title>
        );
    };

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

    const mainDisplayText = getMainDisplay();

    // Determine background color and opacity based on meeting state
    const backgroundColor = isOldPastMeeting() ? '#E8E8E8' : PALE_BLUE;
    const cardOpacity = isOldPastMeeting() ? 0.7 : 1;

    return (
        <View style={{ opacity: cardOpacity }}>
            <EventCard backgroundColor={backgroundColor}>
                <EventCard.Header spacing="between" align="start">
                    {mainDisplayText}

                    <EventCard.Button
                        onPress={handleCancelMeeting}
                        loading={isCanceling}
                        variant="danger"
                        size="small"
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </EventCard.Button>
                </EventCard.Header>

                <EventCard.Body>
                    <EventCard.Description>
                        {getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}
                    </EventCard.Description>

                    {DEV_FLAG && (
                        <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
                    )}
                </EventCard.Body>
            </EventCard>
        </View>
    );
}

const styles = StyleSheet.create({
    cancelButtonText: {
        color: PALE_BLUE,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});

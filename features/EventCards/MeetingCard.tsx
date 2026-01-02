import AnimatedText from "@/components/AnimatedText";
import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { BRIGHT_BLUE, CHOCOLATE_COLOR, ORANGE, PALE_BLUE } from "@/styles/styles";
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
            <Text style={styles.searchingText}>
                <Text>{eventCardText.meeting_self_open.title()}{'\n'}</Text>
                <View style={styles.displayTimeContainer}>
                    <Text style={styles.searchingText}>{displayTimeDifference(meeting.scheduledFor)}</Text>
                    <AnimatedText
                        text="..."
                        style={{ fontSize: 20, fontFamily: CustomFonts.ztnaturebold, color: ORANGE }}
                        duration={300}
                        staggerDelay={500}
                        inline={false}
                    />
                </View>
            </Text>
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
        <View style={styles.searchingText}>
            <Text style={styles.searchingText}>
                {eventCardText.meeting_self_accepted.title(name)}{displayTimeDifference(meeting.scheduledFor)}
            </Text>
        </View>
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
                    const baseTitle = getOpenMeetingTitle();
                    return `sent an offer out to → ${targetNames}`;
                }
                return getOpenMeetingTitle();
            }
        }
        const name = meeting.userFrom?.name;
        const baseText = name ? `Accepted a meeting created by ${name}` : null;

        // Check if there are target users for accepted meetings
        const targetNames = getTargetUserNames(meeting);
        if (baseText && targetNames) {
            return `${baseText} → ${targetNames}`;
        }
        return baseText;
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
                    {mainDisplayText && (
                        <Text style={styles.mainText}>{mainDisplayText}</Text>
                    )}

                    <EventCard.Button
                        onPress={handleCancelMeeting}
                        loading={isCanceling}
                        variant="ghost"
                        size="small"
                    >
                        <Text style={styles.deleteButtonText}>Cancel</Text>
                    </EventCard.Button>
                </EventCard.Header>

                <EventCard.Body>
                    <Text style={styles.timeText}>
                        {getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}
                    </Text>

                    {DEV_FLAG && (
                        <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
                    )}
                </EventCard.Body>
            </EventCard>
        </View>
    );
}

const styles = StyleSheet.create({
    searchingText: {
        fontSize: 20,
        fontWeight: '600',
        color: ORANGE,
        fontFamily: CustomFonts.ztnaturebold,
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: BRIGHT_BLUE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnatureregular,
    },
    mainText: {
        fontSize: 20,
        fontWeight: '600',
        color: ORANGE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnaturebold,
        flexShrink: 1, // Allow text to wrap/shrink to prevent overflow
    },
    displayTimeContainer: {
        flexDirection: 'row',
    },
    deleteButtonText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturebold,
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});

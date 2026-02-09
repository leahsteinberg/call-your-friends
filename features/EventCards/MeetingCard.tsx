import AnimatedText from "@/components/AnimationComponents/AnimatedText";
import { EventCard } from "@/components/EventCard/EventCard";
import MeetingActionBanner from "@/components/MeetingActionBanner/MeetingActionBanner";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { BOLD_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { isMeetingActionable } from "@/utils/meetingTimeUtils";
import { getDisplayNameList, getTargetUserNames } from "@/utils/nameStringUtils";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

export type MeetingCardState = "SELF_OPEN" | "SELF_ACCEPTED" | "OTHER_ACCEPTED";
export const SELF_OPEN: MeetingCardState = "SELF_OPEN" as const;
export const SELF_ACCEPTED: MeetingCardState = "SELF_ACCEPTED" as const;
export const OTHER_ACCEPTED: MeetingCardState = "OTHER_ACCEPTED" as const;

interface MeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function MeetingCard({ meeting }: MeetingCardProps): React.JSX.Element {
    console.log("MEETING CARD -,", meeting)
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const userName: string | undefined = useSelector((state: RootState) => state.auth.user.name);
    const [cancelMeeting] = useCancelMeetingMutation();
    const [isCanceling, setIsCanceling] = useState(false);

    const meetingState: MeetingState  = meeting.meetingState;
    const selfCreatedMeeting = meeting.userFromId === userId;
    const hasAcceptedUsers = meeting.acceptedUserIds.length !== 0;
    const meetingCardState = selfCreatedMeeting ? (hasAcceptedUsers ? SELF_ACCEPTED : SELF_OPEN) : (OTHER_ACCEPTED);

    const getOtherAcceptedMeetingTitle = () => {
        const name = meeting.userFrom?.name;
            return (
                <EventCard.Title>
                    {name ? `Accepted a meeting created by ${name}` : 'Accepted meeting'}
                </EventCard.Title>
            );
    };

    const getSelfOpenMeetingTitle = () => {
        const targetNames = getTargetUserNames(meeting);
            if (targetNames) {
                return (
                    <EventCard.Title>
                        We'll see if {targetNames} is free {displayTimeDifference(meeting.scheduledFor)}
                    </EventCard.Title>
                );
            }
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
    }

    const getSelfAcceptedMeetingTitle = () => {
        const names = getDisplayNameList(meeting.acceptedUsers || []);
        return (
            <EventCard.Title>
                {eventCardText.meeting_self_accepted.title(names)}{displayTimeDifference(meeting.scheduledFor)}
            </EventCard.Title>
        );

    }

    const getMainDisplayText = () => {
        switch (meetingCardState) {
            case SELF_ACCEPTED:
                return getSelfAcceptedMeetingTitle();

            case SELF_OPEN:
                return getSelfOpenMeetingTitle();

            case OTHER_ACCEPTED:
                return getOtherAcceptedMeetingTitle();
        }
    };

    const handleCancelMeeting = async () => {
        try {
            setIsCanceling(true);
            dispatch(deleteMeetingOptimistic(meeting.id));
            try {
                const response = await cancelMeeting({
                    meetingId: meeting.id,
                    userId
                }).unwrap();
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

    const cancelButton = () => {
        return (
            <EventCard.Button
                onPress={handleCancelMeeting}
                loading={isCanceling}
                variant="primary"
                size="small"
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </EventCard.Button>
        );
    };


    // Banner is visible when meeting is ≤30 mins away or happening
    const isBannerVisible = isMeetingActionable(meeting.scheduledFor, meeting.scheduledEnd);
    // Banner only applies to accepted meetings (not SELF_OPEN)
    const canShowBanner = meetingCardState !== SELF_OPEN;

    return (
        <View>
            <EventCard
                backgroundColor={meetingCardState === SELF_OPEN ? PALE_BLUE : BOLD_BLUE}
                hasBanner={canShowBanner && isBannerVisible}
            >
                <EventCard.Header spacing="between" align="start">
                    <EventCard.Row>
                        {meetingCardState === OTHER_ACCEPTED && (
                            <EventCard.Avatar user={meeting.userFrom} />
                        )}
                        {meetingCardState === SELF_ACCEPTED && meeting.acceptedUsers && (
                            <EventCard.Avatar users={meeting.acceptedUsers} />
                        )}
                        {meetingCardState === SELF_OPEN && meeting.targetUsers && (
                            <EventCard.Avatar users={meeting.targetUsers} />
                        )}
                        {getMainDisplayText()}
                    </EventCard.Row>
                    {cancelButton()}
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

            {canShowBanner && (
                <MeetingActionBanner
                    meeting={meeting}
                    meetingCardState={meetingCardState}
                    visible={isBannerVisible}
                />
            )}
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

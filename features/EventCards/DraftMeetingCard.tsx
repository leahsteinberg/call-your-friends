import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptSuggestionMutation, useDismissSuggestionMutation } from "@/services/meetingApi";
import { BOLD_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { getDisplayNameList } from "@/utils/nameStringUtils";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { ProcessedMeetingType } from "../Meetings/types";

interface DraftMeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function DraftMeetingCard({ meeting }: DraftMeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [acceptSuggestion] = useAcceptSuggestionMutation();
    const [dismissSuggestion] = useDismissSuggestionMutation();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);

    const strings = eventCardText.draft_suggestion;

    // Get display name using the shared utility
    const getTargetNames = (): string => {
        if (meeting.targetUsers && meeting.targetUsers.length > 0) {
            return getDisplayNameList(meeting.targetUsers);
        }
        if (meeting.targetUser?.name) {
            return meeting.targetUser.name;
        }
        return 'someone';
    };

    const handleAcceptSuggestion = async () => {
        try {
            setIsAccepting(true);
            dispatch(deleteMeetingOptimistic(meeting.id));

            await acceptSuggestion({
                meetingId: meeting.id,
                userId,
                scheduledFor: meeting.scheduledFor,
            }).unwrap();

            setIsAccepting(false);
        } catch (error) {
            dispatch(addMeetingRollback(meeting));
            console.error("Error accepting suggestion:", error);
            alert('Failed to accept suggestion. The item has been restored.');
            setIsAccepting(false);
        }
    };

    const handleDismissSuggestion = async () => {
        try {
            setIsDismissing(true);
            dispatch(deleteMeetingOptimistic(meeting.id));

            await dismissSuggestion({
                meetingId: meeting.id,
                userId,
            }).unwrap();

            setIsDismissing(false);
        } catch (error) {
            dispatch(addMeetingRollback(meeting));
            console.error("Error dismissing suggestion:", error);
            alert('Failed to dismiss suggestion. The item has been restored.');
            setIsDismissing(false);
        }
    };

    const targetNames = getTargetNames();
    const isSystemPattern = meeting.sourceType === "SYSTEM_PATTERN";

    return (
        <EventCard backgroundColor={BOLD_BLUE}>
            <EventCard.Header spacing="between" align="start">
                <EventCard.Row>
                    {meeting.targetUsers && meeting.targetUsers.length > 0 && (
                        <EventCard.Avatar users={meeting.targetUsers} />
                    )}
                    <EventCard.Title>
                        {(isSystemPattern && meeting.title)
                            ? meeting.title
                            : `Talk with ${targetNames} ${displayTimeDifference(meeting.scheduledFor)}?`}
                    </EventCard.Title>
                </EventCard.Row>

                <EventCard.Actions layout="horizontal" spacing={8}>
                    <EventCard.Button
                        onPress={handleAcceptSuggestion}
                        loading={isAccepting}
                        variant="primary"
                        size="small"
                    >
                        <Text style={styles.acceptButtonText}>
                            {strings.acceptButtonText!()}
                        </Text>
                    </EventCard.Button>
                    <EventCard.Button
                        onPress={handleDismissSuggestion}
                        loading={isDismissing}
                        variant="secondary"
                        size="small"
                    >
                        <Text style={styles.dismissButtonText}>
                            {strings.rejectButtonText!()}
                        </Text>
                    </EventCard.Button>
                </EventCard.Actions>
            </EventCard.Header>

            <EventCard.Body>
                <EventCard.Description>
                    {getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}
                </EventCard.Description>

                {DEV_FLAG && (
                    <Text style={styles.debugText}>
                        ID: {meeting.id.substring(0, 4)} (DRAFT)
                    </Text>
                )}
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    acceptButtonText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    dismissButtonText: {
        fontSize: 12,
        color: PALE_BLUE,
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

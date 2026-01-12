import AnimatedText from "@/components/AnimationComponents/AnimatedText";
import VibeButton from "@/components/CardActionDecorations/VibeButton";
import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { BOLD_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast } from "../Broadcast/broadcastSlice";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedMeetingType } from "../Meetings/types";

interface SelfBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Card for self-created broadcast meetings
export default function SelfBroadcastCard({ meeting }: SelfBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [endBroadcastRequest] = useBroadcastEndMutation();
    const [isEnding, setIsEnding] = useState(false);
    const selectedVibe = meeting.intentLabel || null;


    const acceptedUsers = meeting.acceptedUsers || [];
    const targetUsers = meeting.targetUsers || [];

    const hasAcceptedUsers = acceptedUsers.length > 0;
    const hasTargetUsers = targetUsers.length > 0;


    // Get display names based on current state
    const displayNames = hasAcceptedUsers
        ? acceptedUsers.map(user => user.name).filter(Boolean).join(', ')
        : hasTargetUsers
            ? targetUsers.map(user => user.name).filter(Boolean).join(', ')
            : null;

    const strings = hasAcceptedUsers
        ? eventCardText.broadcast_self_accepted
        : eventCardText.broadcast_self_open;

    const showAnimatedDots = !hasAcceptedUsers;

    const titleText = displayNames
        ? strings.mainText!(displayNames)
        : strings.mainText!();


    const handleCancelMeeting = async () => {
        try {
            setIsEnding(true);

            dispatch(deleteMeetingOptimistic(meeting.id));

            try {
                await endBroadcastRequest({
                    meetingId: meeting.id,
                    userId
                }).unwrap();

                // Success - turn off the broadcast toggle
                dispatch(endBroadcast());
                setIsEnding(false);
            } catch (apiError) {
                // ROLLBACK - restore the meeting to UI
                dispatch(addMeetingRollback(meeting));
                // DO NOT call endBroadcast() - broadcast is still active
                throw apiError;
            }

        } catch (error) {
            console.error("Error ending broadcast meeting:", error);
            alert('Failed to cancel broadcast. The item has been restored.');
            setIsEnding(false);
        }
    };

    return (
        <EventCard backgroundColor={BOLD_BLUE}>
            {/* Vibe badge in top-right corner */}
            
            {selectedVibe &&
                <EventCard.Decoration position="top-right">
                    <VibeButton
                        selectedVibe={selectedVibe}
                        displayOnly={true}
                    />
                </EventCard.Decoration>
            }

            <EventCard.Header spacing="between" align="start">
                <EventCard.Row gap={0}>
                    <EventCard.Title>{titleText}</EventCard.Title>
                    {showAnimatedDots && (
                        <AnimatedText
                            text="..."
                            style={{ fontSize: 28, color: CREAM, fontWeight: '600' }}
                            duration={300}
                            staggerDelay={500}
                            inline={true}
                        />
                    )}
                </EventCard.Row>
                <EventCard.Button
                    onPress={handleCancelMeeting}
                    loading={isEnding}
                    variant="danger"
                    size="small"
                >
                    <Text style={styles.endBroadcastButtonText}>
                        {strings.acceptButtonText!()}
                    </Text>
                </EventCard.Button>
            </EventCard.Header>

            <EventCard.Body>

                <EventCard.Description>
                    {strings.title!()}
                </EventCard.Description>

                {DEV_FLAG && (
                    <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
                )}
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    endBroadcastButtonText: {
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

import AnimatedText from "@/components/AnimatedText";
import { EventCard } from "@/components/EventCard/EventCard";
import TapbackDecoration from "@/components/TapbackDecoration";
import VibeTapBack from "@/components/VibeTapBack";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { BOLD_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { ACCEPTED_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast } from "../Broadcast/broadcastSlice";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface SelfBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Card for self-created broadcast meetings
export default function SelfBroadcastCard({ meeting }: SelfBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [endBroadcastRequest] = useBroadcastEndMutation();
    const [isEnding, setIsEnding] = useState(false);
    const [selectedTapback, setSelectedTapback] = useState<string | null>(null);

    const meetingState: MeetingState = meeting.meetingState;
    const isClaimed = meetingState === ACCEPTED_MEETING_STATE;
    const strings = isClaimed ?
        eventCardText.broadcast_self_accepted
        : eventCardText.broadcast_self_open ;


    const getTitle = () => {
        return isClaimed ? (
            <EventCard.Row gap={0}>
            <EventCard.Title>{strings.mainText!(getOtherUserName())}</EventCard.Title>
        </EventCard.Row>
        ) : (
            <EventCard.Row gap={0}>
                <EventCard.Title>{strings.mainText!()}</EventCard.Title>
                <AnimatedText
                    text="..."
                    style={{ fontSize: 28, color: CREAM, fontWeight: '600' }}
                    duration={300}
                    staggerDelay={500}
                />
            </EventCard.Row>
        );

    };
    // Get the name(s) to display - handles both single and multiple accepted users
    const getOtherUserName = () => {
        // Try new multi-user field first
        if (meeting.acceptedUsers && meeting.acceptedUsers.length > 0) {
            const names = meeting.acceptedUsers.map(user => user.name).filter(Boolean);
            if (names.length > 0) {
                return names.join(', ');
            }
        }
        // Fallback to single acceptedUser for backwards compatibility
        if (meeting.acceptedUser) {
            return meeting.acceptedUser?.name;
        }
    }

    // Handle tapback selection
    const handleTapback = (iconId: string | null, cardData?: any) => {
        console.log(`Tapback selected: ${iconId} for meeting ${cardData}`);
        setSelectedTapback(iconId);
        // TODO: Send tapback to server
    };

    const handleCancelMeeting = async () => {
        try {
            setIsEnding(true);

            // Optimistic update FIRST - remove from UI immediately
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
        <EventCard
            backgroundColor={BOLD_BLUE}
            gesture={(props) => (
                <VibeTapBack onTapbackSelect={handleTapback} cardData={meeting.id} useWords={true}>
                    {props.children}
                </VibeTapBack>
            )}
        >
            {/* Tapback decoration in top-right corner */}
            <EventCard.Decoration position="top-right">
                <TapbackDecoration selectedTapback={selectedTapback} useWords={true} />
            </EventCard.Decoration>

            <EventCard.Header spacing="between" align="start">
                {getTitle()}
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

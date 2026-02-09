import CallUserButton from "@/components/CallUserButton";
import VibeButton from "@/components/CardActionDecorations/VibeButton";
import { EventCard } from "@/components/EventCard/EventCard";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { BOLD_BLUE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedMeetingType } from "../Meetings/types";

interface OtherMeetingBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Card for broadcast meetings that the user accepted (not created)
export default function OtherMeetingBroadcastCard({ meeting }: OtherMeetingBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [isCanceling, setIsCanceling] = useState(false);
    const [cancelMeeting] = useCancelMeetingMutation();
    const selectedVibe = meeting.intentLabel || null;

    const handleCallEnd = async () => {
        console.log("In OtherMeetingBroadcastCard, call over!!")
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

    const getFromName = () => {
        return meeting.userFrom?.name || 'someone';
    };

    const titleText = `${getFromName()} is ready for your call`;

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
                <EventCard.Row>
                    <EventCard.Avatar user={meeting.userFrom} />
                    <EventCard.Title>{titleText}</EventCard.Title>
                </EventCard.Row>

                <EventCard.Button
                    onPress={handleCancelMeeting}
                    loading={isCanceling}
                    variant="secondary"
                    size="small"
                >
                    <Text style={styles.unclaimButtonText}>Unclaim Call</Text>
                </EventCard.Button>
            </EventCard.Header>

            <EventCard.Body>
                <EventCard.Description>
                    You claimed the call
                </EventCard.Description>

                {(Platform.OS !== 'web' || DEV_FLAG) &&
                    <CallUserButton
                        phoneNumber={meeting.userFrom?.phoneNumber || ''}
                        userName={getFromName()}
                        userId={userId}
                        participantId={meeting.userFromId}
                        meetingId={meeting.id}
                        buttonText="Call Now"
                        style={{
                            marginTop: 12,
                            backgroundColor: PALE_BLUE,
                            borderWidth: 2,
                            borderColor: BOLD_BLUE,
                        }}
                        textStyle={{
                            color: BOLD_BLUE,
                            fontWeight: '600',
                            fontFamily: CustomFonts.ztnaturemedium,
                        }}
                    />
                }

                {DEV_FLAG && (
                    <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
                )}
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    unclaimButtonText: {
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

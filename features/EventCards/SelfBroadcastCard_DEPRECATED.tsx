import StackedFriendAvatars from "@/components/CardActionDecorations/StackedFriendAvatars";
import VibeButton from "@/components/CardActionDecorations/VibeButton";
import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { BOLD_BLUE, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { getDisplayNameList } from "@/utils/nameStringUtils";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
    const friends = hasAcceptedUsers ? acceptedUsers : (hasTargetUsers ? targetUsers : []);
    const displayNames = getDisplayNameList(friends);
    
    const strings = hasAcceptedUsers
        ? eventCardText.broadcast_self_accepted
        : eventCardText.broadcast_self_open;

    const showAnimatedDots = !hasAcceptedUsers;

    const titleText = strings.mainText!(displayNames);
    // const titleText = `You're in call me mode`;

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
        <EventCard backgroundColor={BOLD_BLUE} showTint={false} showBorder={false}>
            {/* Vibe badge in top-right corner */}
            
            {selectedVibe &&
                <EventCard.Decoration position="top-right">
                    <VibeButton
                        selectedVibe={selectedVibe}
                        displayOnly={true}
                    />
                </EventCard.Decoration>
            }
                    <EventCard.Pill backgroundColor={'transparent'} textColor={CREAM}>
                        CALL ME MODE
                    </EventCard.Pill>
            <EventCard.Header spacing="center" align="center">


                <EventCard.Row gap={0}>
                    <EventCard.LiveTitle size="large">
                        {titleText}
                        {/* {`You're in call me mode`} */}
                    </EventCard.LiveTitle>
                </EventCard.Row>
            </EventCard.Header>

            <EventCard.Body>
                {/* <EventCard.Description>
                    {strings.title!(displayNames)}
                </EventCard.Description> */}

                {/* Show target users badge if broadcast is directed to specific friends */}
                {hasTargetUsers && (
                    <View style={styles.targetUsersContainer}>
                        <StackedFriendAvatars
                            selectedFriends={targetUsers}
                            expanded={false}
                        />
                        <View style={styles.targetUsersBadge}>
                            <Text style={styles.targetUsersText}>
                                {targetUsers.length === 1
                                    ? `Shared with ${targetUsers[0].name}`
                                    : `Shared with ${targetUsers.length} friends`}
                            </Text>
                        </View>
                    </View>
                )}
                <EventCard.Button
                    onPress={handleCancelMeeting}
                    loading={isEnding}
                    variant="secondary"
                    size="small"
                >
                    <Text style={styles.endBroadcastButtonText}>
                        {strings.acceptButtonText!()}
                    </Text>
                </EventCard.Button>
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    animatedDots: {
        fontSize: 28,
        color: CREAM,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturebold,
    },
    endBroadcastButtonText: {
        color: PALE_BLUE,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    targetUsersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    targetUsersBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: CORNFLOWER_BLUE,
    },
    targetUsersText: {
        fontSize: 12,
        fontWeight: '600',
        color: CREAM,
        fontFamily: CustomFonts.ztnaturemedium,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});

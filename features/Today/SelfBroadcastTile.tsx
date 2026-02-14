import Avatar from "@/components/Avatar/Avatar";
import StackedFriendAvatars from "@/components/CardActionDecorations/StackedFriendAvatars";
import { BroadcastTile } from "@/components/EventCard/BroadcastTile";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast } from "../Broadcast/broadcastSlice";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeRemaining } from "../Meetings/meetingsUtils";
import type { ProcessedMeetingType } from "../Meetings/types";

interface SelfBroadcastTileProps {
    meeting: ProcessedMeetingType;
}

export default function SelfBroadcastTile({ meeting }: SelfBroadcastTileProps): React.JSX.Element {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [endBroadcastRequest] = useBroadcastEndMutation();
    const [isEnding, setIsEnding] = useState(false);

    const handleEnd = async () => {
        try {
            setIsEnding(true);
            dispatch(deleteMeetingOptimistic(meeting.id));
            try {
                await endBroadcastRequest({ meetingId: meeting.id, userId: user.id }).unwrap();
                dispatch(endBroadcast());
                setIsEnding(false);
            } catch (apiError) {
                dispatch(addMeetingRollback(meeting));
                throw apiError;
            }
        } catch (error) {
            console.error("Error ending broadcast:", error);
            alert('Failed to end broadcast. Please try again.');
            setIsEnding(false);
        }
    };

    const timeText = meeting.scheduledEnd ? displayTimeRemaining(meeting.scheduledEnd) : '';
    const targetUsers = meeting.targetUsers || [];

    return (
        <>
        <BroadcastTile
            user={{ name: "Me", avatarUrl: user.avatarUrl, id: user.id }}
            // timeRemainingText={timeText}
            scheduledEnd={meeting.scheduledEnd || undefined}
            // actionLabel="End"
            // actionIcon="xmark"
            onSecondaryAction={handleEnd}
            isLoading={isEnding}
            avatarChildren={
                <>
                    <Avatar.SpeechBubble selectedVibe={meeting.intentLabel} displayOnly />
                    {/* <Avatar.TimerRing scheduledEnd={meeting.scheduledEnd} /> */}
                    <Avatar.GradientRing/>
                </>
            }
            footer={
                targetUsers.length > 0 ? (
                    <StackedFriendAvatars
                        selectedFriends={targetUsers as any}
                        expanded={false}
                    />
                ) : undefined
            }
        />
        <Text>{meeting.id}</Text>
        </>
        
    );
}

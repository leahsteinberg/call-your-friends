import Avatar from "@/components/Avatar/Avatar";
import { BroadcastTile } from "@/components/EventCard/BroadcastTile";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast } from "../Broadcast/broadcastSlice";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeRemaining } from "../Meetings/meetingsUtils";
import type { ProcessedMeetingType } from "../Meetings/types";

interface SelfClaimedBroadcastTileProps {
    meeting: ProcessedMeetingType;
}

export default function SelfClaimedBroadcastTile({ meeting }: SelfClaimedBroadcastTileProps): React.JSX.Element {
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
    const claimer = meeting.acceptedUsers?.[0];

    return (
        <BroadcastTile
            user={{ name: "Me", avatarUrl: user.avatarUrl, id: user.id }}
            vibe={meeting.intentLabel}
            timeRemainingText={timeText}
            scheduledEnd={meeting.scheduledEnd || undefined}
            actionLabel="End"
            actionIcon="xmark"
            onAction={handleEnd}
            isLoading={isEnding}
            avatarChildren={
                claimer && <Avatar.MiniAvatar name={claimer.name} avatarUrl={claimer.avatarUrl} />
            }
        />
    );
}

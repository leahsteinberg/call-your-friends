import { BroadcastTile } from "@/components/EventCard/BroadcastTile";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { Linking, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeRemaining } from "../Meetings/meetingsUtils";
import type { ProcessedMeetingType } from "../Meetings/types";

interface ClaimedBroadcastTileProps {
    meeting: ProcessedMeetingType;
}

export default function ClaimedBroadcastTile({ meeting }: ClaimedBroadcastTileProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [cancelMeeting] = useCancelMeetingMutation();
    const [isCanceling, setIsCanceling] = useState(false);

    const handleCallNow = async () => {
        const phoneNumber = meeting.userFrom?.phoneNumber;
        if (phoneNumber && Platform.OS !== 'web') {
            const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
            await Linking.openURL(`tel:${cleaned}`);
        }
    };

    const handleUnclaim = async () => {
        try {
            setIsCanceling(true);
            dispatch(deleteMeetingOptimistic(meeting.id));
            try {
                await cancelMeeting({ meetingId: meeting.id, userId }).unwrap();
                setIsCanceling(false);
            } catch (apiError) {
                dispatch(addMeetingRollback(meeting));
                throw apiError;
            }
        } catch (error) {
            console.error("Error unclaiming broadcast:", error);
            alert('Failed to unclaim. The item has been restored.');
            setIsCanceling(false);
        }
    };

    const timeText = meeting.scheduledEnd ? displayTimeRemaining(meeting.scheduledEnd) : '';

    return (
        <BroadcastTile
            user={meeting.userFrom}
            vibe={meeting.intentLabel}
            timeRemainingText={timeText}
            scheduledEnd={meeting.scheduledEnd || undefined}
            actionLabel="Call Now"
            actionIcon="phone.fill"
            onAction={handleCallNow}
            onSecondaryAction={handleUnclaim}
            isSecondaryLoading={isCanceling}
            backgroundColor="transparent"
        />
    );
}

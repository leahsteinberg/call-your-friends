import Avatar from "@/components/Avatar/Avatar";
import { BroadcastTile } from "@/components/EventCard/BroadcastTile";
import { useBroadcastSettings } from "@/features/Broadcast/BroadcastSettingsContext";
import { useHasClaimedBroadcast } from "@/hooks/useIsBroadcasting";
import { useAcceptOfferMutation } from "@/services/offersApi";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { displayTimeRemaining } from "../Meetings/meetingsUtils";
import type { ProcessedOfferType } from "../Offers/types";

interface UnclaimedBroadcastTileProps {
    offer: ProcessedOfferType;
}

export default function UnclaimedBroadcastTile({ offer }: UnclaimedBroadcastTileProps): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [acceptOffer] = useAcceptOfferMutation();
    const [isAccepting, setIsAccepting] = useState(false);
    const hasClaimedOtherBroadcast = useHasClaimedBroadcast(userId);
    const { hasUnclaimedSelfBroadcast, isSelfBroadcastClaimed, handleEndBroadcast } = useBroadcastSettings();

    const handleClaim = async () => {
        try {
            setIsAccepting(true);
            // Auto-end own unclaimed broadcast before claiming another's
            if (hasUnclaimedSelfBroadcast) {
                await handleEndBroadcast();
            }
            await acceptOffer({ userId, offerId: offer.id }).unwrap();
        } catch (error) {
            console.error("Error claiming broadcast:", error);
            alert('Failed to claim broadcast. Please try again.');
            setIsAccepting(false);
        }
    };

    const scheduledEnd = offer.meeting?.scheduledEnd || '';
    const timeText = scheduledEnd ? displayTimeRemaining(scheduledEnd) : '';

    return (
        <BroadcastTile
            user={offer.meeting?.userFrom}
            timeRemainingText={timeText}
            scheduledEnd={scheduledEnd || undefined}
            actionLabel={"Talk Now"}
            actionIcon="message.fill"
            onAction={handleClaim}
            isLoading={isAccepting}
            hasAction={!hasClaimedOtherBroadcast && !isSelfBroadcastClaimed}
            backgroundColor="transparent"
            avatarChildren={
                <>
                    <Avatar.SpeechBubble selectedVibe={offer.meeting?.intentLabel} displayOnly />
                    <Avatar.TimerRing scheduledEnd={offer.meeting?.scheduledEnd} />
                </>
            }
        />
    );
}

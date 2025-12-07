/**
 * Card Selection Utilities
 *
 * Centralized logic for determining which event card component to render
 * based on the type and state of meetings/offers.
 */

import React from "react";
import type { ProcessedMeetingType } from "../Meetings/types";
import type { ProcessedOfferType } from "../Offers/types";
import MeetingCard from "./MeetingCard";
import OfferCard from "./OfferCard";
import OtherMeetingBroadcastCard from "./OtherMeetingBroadcastCard";
import OtherBroadcastCard from "./OtherOfferBroadcastCard";
import SelfBroadcastCard from "./SelfBroadcastCard";

interface CardSelectorProps {
    userId: string;
    refresh?: () => void;
}

/**
 * Selects the appropriate card component for a meeting
 *
 * Logic:
 * - If broadcast meeting created by user → SelfBroadcastCard
 * - If broadcast meeting created by others → OtherBroadcastCard (with meeting data)
 * - Otherwise → MeetingCard (regular meeting, self or other)
 */
export function selectMeetingCard(
    meeting: ProcessedMeetingType,
    { userId, refresh }: CardSelectorProps
): React.JSX.Element {
    if (meeting.meetingType === 'BROADCAST') {
        const selfCreated = meeting.userFromId === userId;

        if (selfCreated) {
            // Self-created broadcast (all states)
            return <SelfBroadcastCard meeting={meeting} />
        } else {
            // Other's broadcast that user accepted
            return <OtherMeetingBroadcastCard meeting={meeting}  />
        }
    }
    // Regular meeting (self-created or accepted other's meeting)
    return <MeetingCard meeting={meeting} />;
}

/**
 * Selects the appropriate card component for an offer
 *
 * Logic:
 * - If broadcast offer → OtherBroadcastCard (with offer data)
 * - Otherwise → OfferCard (regular meeting offer)
 */
export function selectOfferCard(
    offer: ProcessedOfferType,
    { refresh }: Pick<CardSelectorProps, 'refresh'>
): React.JSX.Element {
    if (offer.offerType === 'BROADCAST') {
        // Other's broadcast in offer state
        return <OtherBroadcastCard offer={offer} />;
    }

    // Regular meeting offer
    return <OfferCard offer={offer}  />;
}

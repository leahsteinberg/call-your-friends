import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptOfferMutation, useRejectOfferMutation } from "@/services/offersApi";
import { CREAM, PALE_BLUE } from "@/styles/styles";
import { OPEN_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getTargetUserNames } from "@/utils/nameStringUtils";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addOfferRollback, deleteOfferOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { ProcessedOfferType } from "../Offers/types";

interface OfferCardProps {
    offer: ProcessedOfferType;
}

export default function OfferCard({ offer }: OfferCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [acceptOffer] = useAcceptOfferMutation();
    const [rejectOffer] = useRejectOfferMutation();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);


    const offerId = offer.id;

    const handleAcceptOffer = async () => {
        try {
            setIsAccepting(true)
            await acceptOffer({ userId, offerId }).unwrap();
            // RTK Query will auto-refresh via cache invalidation
            setIsRejecting(false)

        } catch (error) {
            console.error("Error accepting offer:", error);
            alert('Failed to accept offer. Please try again.');
            setIsAccepting(false);
        }
    };

    const handleRejectOffer = async () => {
        try {
            setIsRejecting(true);

            // Optimistic update FIRST - remove from UI immediately
            dispatch(deleteOfferOptimistic(offerId));

            try {
                await rejectOffer({ userId, offerId }).unwrap();
                // Success - optimistic update already applied
                setIsRejecting(false);
            } catch (apiError) {
                // ROLLBACK - restore the offer to UI
                dispatch(addOfferRollback(offer));
                throw apiError;
            }

        } catch (error) {
            console.error("Error rejecting offer:", error);
            alert('Failed to reject offer. The item has been restored.');
            setIsRejecting(false);
        }
    };

    // Get the name from the offer
    const getFromName = () => {
        return offer.meeting?.userFrom?.name || 'Unknown';
    };

    const strings = eventCardText.open_offer;
    const targetUserName = offer.meeting ? getTargetUserNames(offer.meeting) : null;

    return (
        <EventCard backgroundColor={PALE_BLUE}>
            <EventCard.Header spacing="between" align="start">
                <EventCard.Row>
                    <EventCard.Avatar user={offer.meeting?.userFrom} />
                    <EventCard.Title>
                        {strings.nameText!(getFromName(), displayTimeDifference(offer.meeting?.scheduledFor))}
                        {targetUserName && ` → ${targetUserName}`}
                    </EventCard.Title>
                </EventCard.Row>

                {offer.offerState === OPEN_OFFER_STATE && (
                    <EventCard.Actions layout="horizontal" spacing={8}>
                        <EventCard.Button
                            onPress={handleAcceptOffer}
                            loading={isAccepting}
                            variant="primary"
                            size="small"
                        >
                            <Text style={styles.acceptButtonText}>
                                {strings.acceptButtonText!()}
                            </Text>
                        </EventCard.Button>

                        <EventCard.Button
                            onPress={handleRejectOffer}
                            loading={isRejecting}
                            variant="danger"
                            size="small"
                        >
                            <Text style={styles.rejectButtonText}>
                                {strings.rejectButtonText!()}
                            </Text>
                        </EventCard.Button>
                    </EventCard.Actions>
                )}
            </EventCard.Header>

            <EventCard.Body>
                <EventCard.Description>
                    {strings.mainText!(getFromName(), displayTimeDifference(offer.scheduledFor))}
                </EventCard.Description>

                <EventCard.Description>
                    {getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}
                </EventCard.Description>

                {DEV_FLAG && (
                    <Text style={styles.debugText}>ID: {offer.id.substring(0, 4)}</Text>
                )}
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    acceptButtonText: {
        color: CREAM,
        //backgroundColor: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    rejectButtonText: {
        fontSize: 12,
        color: CREAM,
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

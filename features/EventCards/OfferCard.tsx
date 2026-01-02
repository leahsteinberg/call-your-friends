import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptOfferMutation, useRejectOfferMutation } from "@/services/offersApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CHOCOLATE_COLOR, CORNFLOWER_BLUE, ORANGE, PALE_BLUE } from "@/styles/styles";
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
    console.log("offer card!!!!!");
    const dispatch = useDispatch();
    console.log(offer)
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
                <EventCard.Title size="medium" color={ORANGE}>
                    {strings.nameText!(getFromName())}
                    {targetUserName && ` → ${targetUserName}`}
                </EventCard.Title>

                {offer.offerState === OPEN_OFFER_STATE && (
                    <EventCard.Actions layout="horizontal" spacing={8}>
                        <EventCard.Button
                            onPress={handleAcceptOffer}
                            loading={isAccepting}
                            variant="ghost"
                            size="small"
                        >
                            <Text style={styles.acceptButtonText}>
                                {strings.acceptButtonText!()}
                            </Text>
                        </EventCard.Button>

                        <EventCard.Button
                            onPress={handleRejectOffer}
                            loading={isRejecting}
                            variant="ghost"
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
                <Text style={styles.mainText}>
                    {strings.mainText!(getFromName(), displayTimeDifference(offer.scheduledFor))}
                </Text>

                <Text style={styles.timeText}>
                    {getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}
                </Text>

                {DEV_FLAG && (
                    <Text style={styles.debugText}>ID: {offer.id.substring(0, 4)}</Text>
                )}
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    mainText: {
        fontSize: 14,
        fontWeight: '600',
        color: CORNFLOWER_BLUE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnatureregular,
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: BRIGHT_BLUE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    acceptButtonText: {
        color: BRIGHT_GREEN,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    rejectButtonText: {
        fontSize: 12,
        color: CHOCOLATE_COLOR,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
});

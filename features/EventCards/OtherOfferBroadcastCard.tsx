import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import {
    useAcceptOfferMutation,
    useRejectOfferMutation
} from "@/services/offersApi";
import { BOLD_BROWN, BOLD_ORANGE } from "@/styles/styles";
import { OPEN_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getTargetUserNames } from "@/utils/nameStringUtils";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { addOfferRollback, deleteOfferOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedOfferType } from "../Offers/types";

interface OtherOfferBroadcastCardProps {
    offer: ProcessedOfferType;
}

export default function OtherOfferBroadcastCard({ offer }: OtherOfferBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const flowerRotation = useSharedValue(240);
    const [acceptOffer] = useAcceptOfferMutation();
    const [rejectOffer] = useRejectOfferMutation();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const offerId = offer.id;
    const strings = eventCardText.broadcast_other_open;
    console.log("STRINGS", strings);



    const animatedFlowerStyle = useAnimatedStyle(() => ({
        transform: [{rotate: `${flowerRotation.value}deg`}]
    }));

    useEffect(()=>{
        flowerRotation.value = withRepeat(
            withSequence(
                withTiming(270, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(240, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // Repeat indefinitely
            false
        );
    },
    []);

    const handleAccept = async () => {
        try {
            setIsAccepting(true);
            await acceptOffer({ userId, offerId }).unwrap();
            setIsRejecting(false);
        } catch (error) {
            console.error("Error accepting offer:", error);
            alert('Failed to accept offer. Please try again.');
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
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

    const getFromName = () => {
        return offer.meeting?.userFrom?.name || 'Unknown';
    };

    const targetUserName = offer.meeting ? getTargetUserNames(offer.meeting) : null;

    return (
        <EventCard
            backgroundColor={BOLD_ORANGE}
            onPress={handleAccept}
            disabled={isAccepting}
        >
            <EventCard.Header>
                <EventCard.Title>
                    {strings.nameText!(getFromName())}
                    {targetUserName && ` → ${targetUserName}`}
                </EventCard.Title>
            </EventCard.Header>

            <EventCard.Body>
                <EventCard.Description>
                    {strings.mainText!(getFromName())}
                </EventCard.Description>
                <Text style={styles.subText}>{strings.hint(getFromName())}</Text>
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    subText: {
        fontSize: 16,
        color: BOLD_BROWN,
        fontFamily: CustomFonts.ztnaturemedium,
        opacity: 0.7,
    },
});

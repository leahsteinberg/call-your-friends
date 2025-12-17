import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptOfferMutation, useRejectOfferMutation } from "@/services/offersApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CHOCOLATE_COLOR, CORNFLOWER_BLUE, ORANGE, PALE_BLUE } from "@/styles/styles";
import { OPEN_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteOfferOptimistic, addOfferRollback } from "../Meetings/meetingSlice";
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

    const getMainText = () => {
        return `${eventCardText.open_offer.title(getFromName())}${displayTimeDifference(offer.scheduledFor)}`
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.nameText}>{getFromName()}</Text>

                {offer.offerState === OPEN_OFFER_STATE && (
                    <View style={styles.buttonContainer}>
                        {/* <View style={styles.buttonContent}> */}

                        <TouchableOpacity
                            onPress={handleAcceptOffer}
                            style={styles.acceptButton}
                        >
                            {isAccepting? (
                                <ActivityIndicator size="small" color="green" />
                                ) : (
                                    <Text style={styles.acceptButtonText}>Accept</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleRejectOffer}
                            style={styles.rejectButton}
                        >
                            {isRejecting ? (
                                <ActivityIndicator size="small" color="red" />
                                ) : (
                                    <Text style={styles.rejectButtonText}>Reject</Text>
                            )}
                        </TouchableOpacity>
                        {/* </View> */}
                    </View>
                )}
            </View>
            <Text style={styles.mainText}>{getMainText()}</Text>


            <Text style={styles.timeText}>{getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}</Text>

            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {offer.id.substring(0, 4)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        backgroundColor: PALE_BLUE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameText: {
        fontSize: 20,
        fontWeight: '600',
        color: ORANGE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnaturebold,
    },
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
    expiresText: {
        fontFamily: CustomFonts.ztnaturemedium,

    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,

    },
    acceptButton: {
        borderRadius: 4,
        // paddingHorizontal: 10,
        // paddingVertical: 4,
    },
    acceptButtonText: {
        color: BRIGHT_GREEN,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    rejectButton: {
        borderRadius: 4,
        // paddingHorizontal: 10,
        // paddingVertical: 4,
    },
    rejectButtonText: {
        fontSize: 12,
        color: CHOCOLATE_COLOR,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
});

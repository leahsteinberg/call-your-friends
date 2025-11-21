import { useAcceptOfferMutation, useRejectOfferMutation } from "@/services/offersApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { ACCEPTED_OFFER_STATE, OPEN_OFFER_STATE, REJECTED_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteOfferOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedOfferType } from "../Offers/types";

interface OfferCardProps {
    offer: ProcessedOfferType;
    refresh: () => void;

}

export default function OfferCard({ offer, refresh }: OfferCardProps): React.JSX.Element {
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
            await acceptOffer({ userId, offerId });
            refresh();
            setIsRejecting(false)

        } catch (error) {
            console.error("Error accepting offer:", error);
            alert('Failed to accept offer. Please try again.');
        }
    };

    const handleRejectOffer = async () => {
        try {
            setIsRejecting(true);
            await rejectOffer({ userId, offerId }).unwrap();
            dispatch(deleteOfferOptimistic(offerId))

            refresh();
            setIsAccepting(false)
            
        } catch (error) {
            console.error("Error rejecting offer:", error);
            alert('Failed to reject offer. Please try again.');
        }
    };

    // Get the name from the offer
    const getFromName = () => {
        return offer.userFromName || 'Unknown';
    };

    const getStatusText = () => {
        switch (offer.offerState) {
            case OPEN_OFFER_STATE:
                return 'Open';
            case ACCEPTED_OFFER_STATE:
                return 'Accepted';
            case REJECTED_OFFER_STATE:
                return 'Rejected';
            default:
                return offer.offerState;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.typeIndicator}>
                    <Text style={styles.typeText}>Offer</Text>
                </View>
                {offer.offerState === OPEN_OFFER_STATE && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={handleAcceptOffer}
                            style={styles.acceptButton}
                        >
                        {isAccepting ? (
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
                    </View>
                )}
            </View>

            <Text style={styles.timeText}>{getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}</Text>

            <Text style={styles.nameText}>from: {getFromName()}</Text>

            <Text style={styles.statusText}>Status: {getStatusText()}</Text>
            <Text>Expires in: {offer.displayExpiresAt}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: CREAM,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: DARK_BEIGE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeIndicator: {
        backgroundColor: '#5a7d9a',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    typeText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: BRIGHT_BLUE,
        marginBottom: 4,
    },
    nameText: {
        fontSize: 14,
        fontWeight: '600',
        color: ORANGE,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptButton: {
        borderWidth: 1,
        borderColor: BRIGHT_GREEN,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    acceptButtonText: {
        color: BRIGHT_GREEN,
        fontSize: 12,
        fontWeight: '600',
    },
    rejectButton: {
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    rejectButtonText: {
        color: 'red',
        fontSize: 12,
        fontWeight: '600',
    },
});

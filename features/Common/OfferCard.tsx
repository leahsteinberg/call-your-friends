import { useAcceptOfferMutation, useRejectOfferMutation } from "@/services/offersApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import type { ProcessedOfferType } from "../Offers/types";

interface OfferCardProps {
    offer: ProcessedOfferType;
}

export default function OfferCard({ offer }: OfferCardProps): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [acceptOffer] = useAcceptOfferMutation();
    const [rejectOffer] = useRejectOfferMutation();

    const offerId = offer.id;

    // Format date to show "Today" if the offer is today
    const getDisplayDate = () => {
        const offerDate = new Date(offer.scheduledFor);
        const today = new Date();

        const isToday =
            offerDate.getFullYear() === today.getFullYear() &&
            offerDate.getMonth() === today.getMonth() &&
            offerDate.getDate() === today.getDate();

        if (isToday) {
            // Extract time portion from displayScheduledFor (e.g., "at 3:00 PM PST")
            const timeMatch = offer.displayScheduledFor.match(/at\s+.+$/i);
            return timeMatch ? `Today ${timeMatch[0]}` : offer.displayScheduledFor;
        }

        return offer.displayScheduledFor;
    };

    const handleAcceptOffer = async () => {
        try {
            await acceptOffer({ userId, offerId });
        } catch (error) {
            console.error("Error accepting offer:", error);
            alert('Failed to accept offer. Please try again.');
        }
    };

    const handleRejectOffer = async () => {
        try {
            await rejectOffer({ userId, offerId });
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
            case 'PENDING':
                return 'Pending';
            case 'ACCEPTED':
                return 'Accepted';
            case 'REJECTED':
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
                {offer.offerState === 'PENDING' && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={handleAcceptOffer}
                            style={styles.acceptButton}
                        >
                            <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleRejectOffer}
                            style={styles.rejectButton}
                        >
                            <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Text style={styles.timeText}>{getDisplayDate()}</Text>

            <Text style={styles.nameText}>from: {getFromName()}</Text>

            <Text style={styles.statusText}>Status: {getStatusText()}</Text>
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

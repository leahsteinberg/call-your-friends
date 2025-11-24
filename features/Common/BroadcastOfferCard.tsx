import { DEV_FLAG } from "@/environment";
import {
    useAcceptBroadcastMutation,
    useRejectBroadcastMutation,
    useTryAcceptBroadcastMutation
} from "@/services/offersApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { ACCEPTED_OFFER_STATE, OPEN_OFFER_STATE, REJECTED_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteOfferOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedOfferType } from "../Offers/types";

interface BroadcastOfferCardProps {
    offer: ProcessedOfferType;
    refresh: () => void;
}

export default function BroadcastOfferCard({ offer, refresh }: BroadcastOfferCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    // Broadcast-specific mutations
    const [tryAcceptBroadcast] = useTryAcceptBroadcastMutation();
    const [acceptBroadcast] = useAcceptBroadcastMutation();
    const [rejectBroadcast] = useRejectBroadcastMutation();

    // State management
    const [hasTried, setHasTried] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [isTryingAccept, setIsTryingAccept] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const offerId = offer.id;

    const handleTryAccept = async () => {
        try {
            setIsTryingAccept(true);
            const response = await tryAcceptBroadcast({ userId, offerId }).unwrap();

            if (response.success) {
                setHasTried(true);
            } else {
                alert(response.message || 'Could not claim broadcast');
            }
        } catch (error) {
            console.error("Error trying to accept broadcast:", error);
            alert('Failed to claim broadcast. Please try again.');
        } finally {
            setIsTryingAccept(false);
        }
    };

    const handleAccept = async () => {
        try {
            setIsAccepting(true);
            await acceptBroadcast({ userId, offerId }).unwrap();
            setIsAccepted(true);
            refresh();
        } catch (error) {
            console.error("Error accepting broadcast:", error);
            alert('Failed to accept broadcast. Please try again.');
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
        try {
            setIsRejecting(true);
            await rejectBroadcast({ userId, offerId }).unwrap();
            dispatch(deleteOfferOptimistic(offerId));
            refresh();
        } catch (error) {
            console.error("Error rejecting broadcast:", error);
            alert('Failed to reject broadcast. Please try again.');
            setIsRejecting(false);
        }
    };

    // Get the name from the offer
    const getFromName = () => {
        return offer.meeting?.userFrom?.name || 'Unknown';
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
                    <Text style={styles.typeText}>BROADCAST</Text>
                </View>

                {/* Show buttons if offer is open and not yet accepted */}
                {offer.offerState === OPEN_OFFER_STATE && !isAccepted && (
                    <View style={styles.buttonContainer}>
                        {!hasTried ? (
                            <>
                                {/* Initial state: TRY-ACCEPT + REJECT */}
                                <TouchableOpacity
                                    onPress={handleTryAccept}
                                    style={styles.acceptButton}
                                    disabled={isTryingAccept}
                                >
                                    {isTryingAccept ? (
                                        <ActivityIndicator size="small" color="green" />
                                    ) : (
                                        <Text style={styles.acceptButtonText}>TRY-ACCEPT</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleReject}
                                    style={styles.rejectButton}
                                    disabled={isRejecting}
                                >
                                    {isRejecting ? (
                                        <ActivityIndicator size="small" color="red" />
                                    ) : (
                                        <Text style={styles.rejectButtonText}>REJECT</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* After successful try: ACCEPT + CANCEL */}
                                <TouchableOpacity
                                    onPress={handleAccept}
                                    style={styles.acceptButton}
                                    disabled={isAccepting}
                                >
                                    {isAccepting ? (
                                        <ActivityIndicator size="small" color="green" />
                                    ) : (
                                        <Text style={styles.acceptButtonText}>ACCEPT</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleReject}
                                    style={styles.rejectButton}
                                    disabled={isRejecting}
                                >
                                    {isRejecting ? (
                                        <ActivityIndicator size="small" color="red" />
                                    ) : (
                                        <Text style={styles.rejectButtonText}>CANCEL</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}

                {/* Show "Accepted" label after successful acceptance */}
                {isAccepted && (
                    <View style={styles.acceptedLabel}>
                        <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                )}
            </View>

            <Text style={styles.timeText}>{getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}</Text>

            <Text style={styles.nameText}>from: {getFromName()}</Text>

            <Text style={styles.statusText}>Status: {getStatusText()}</Text>
            <Text>Expires in: {offer.displayExpiresAt}</Text>
            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {offer.id.substring(0, 4)}</Text>
            )}
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
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: 'monospace',
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
    acceptedLabel: {
        backgroundColor: BRIGHT_GREEN,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    acceptedText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
    },
});

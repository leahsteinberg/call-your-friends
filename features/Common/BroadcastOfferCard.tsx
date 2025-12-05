import FlowerBlob from "@/assets/images/flower-blob.svg";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import {
    useAcceptBroadcastMutation,
    useRejectBroadcastMutation,
    useTryAcceptBroadcastMutation
} from "@/services/offersApi";
import { BRIGHT_GREEN, CORNFLOWER_BLUE, CREAM, PALE_BLUE, PEACH } from "@/styles/styles";
import { ACCEPTED_OFFER_STATE, OPEN_OFFER_STATE, REJECTED_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteOfferOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedOfferType } from "../Offers/types";
import MyClaimedBroadcastOfferCard from "./MyClaimedBroadcastOfferCard";
import OtherClaimedBroadcastOfferCard from "./OtherClaimedBroadcastOfferCard";

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

    // Broadcast metadata
    const broadcastMetadata = offer.meeting?.broadcastMetadata;
    const subState = broadcastMetadata?.subState;
    const offerClaimedId = broadcastMetadata?.offerClaimedId;

    // Logical flags for different broadcast states
    const isUnclaimed = subState === 'UNCLAIMED';
    const isPendingClaimedBySelf = subState === 'PENDING_CLAIMED' && offerClaimedId === offerId;
    const isPendingClaimedByOther = subState === 'PENDING_CLAIMED' && offerClaimedId !== offerId;
    const isClaimedBySelf = subState === 'CLAIMED' && offerClaimedId === offerId;
    const isClaimedByOther = subState === 'CLAIMED' && offerClaimedId !== offerId;

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
            // RTK Query will auto-refresh via cache invalidation
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
            // RTK Query will auto-refresh via cache invalidation
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

    // Button render functions
    const renderTryAcceptButton = () => (
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
    );

    const renderAcceptButton = () => (
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
    );

    const renderRejectButton = (label: string) => (
        <TouchableOpacity
            onPress={handleReject}
            style={styles.rejectButton}
            disabled={isRejecting}
        >
            {isRejecting ? (
                <ActivityIndicator size="small" color="red" />
            ) : (
                <Text style={styles.rejectButtonText}>{label}</Text>
            )}
        </TouchableOpacity>
    );

    // Render child components based on claim state
    if (isPendingClaimedBySelf || isClaimedBySelf) {
        return <MyClaimedBroadcastOfferCard offer={offer} refresh={refresh} />;
    }

    if (isPendingClaimedByOther || isClaimedByOther) {
        return <OtherClaimedBroadcastOfferCard offer={offer} />;
    }

    // Default: UNCLAIMED state - render original TRY-ACCEPT flow
    return (
        <View style={styles.container}>

            <View style={styles.header}>
                {/* Show "Accepted" label after successful acceptance */}
                {isAccepted && (
                    <View style={styles.acceptedLabel}>
                        <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                )}
            </View>
            {/* <Text style={styles.timeText}>{getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}</Text> */}
            <View style={styles.nameContainer}>
            <FlowerBlob
                    style={{height: 30, width: 30}}
                    fill={CORNFLOWER_BLUE}
                />
               
            {/* <Text>Expires in: {offer.displayExpiresAt}</Text> */}
            </View>
            <Text style={styles.nameText}>{getFromName()}</Text>
            <Text style={styles.titleText}>{eventCardText.broadcast_other_open.title(getFromName())}</Text>
            
                {/* Show buttons if offer is open and not yet accepted */}
            {offer.offerState === OPEN_OFFER_STATE && !isAccepted && (
                <View style={styles.buttonContainer}>
                    {!hasTried ? (
                        <>
                            {/* Initial state: TRY-ACCEPT + REJECT */}
                            {renderTryAcceptButton()}
                            {renderRejectButton('REJECT')}
                        </>
                    ) : (
                        <>
                            {/* After successful try: ACCEPT + CANCEL */}
                            {renderAcceptButton()}
                            {renderRejectButton('CANCEL')}
                        </>
                    )}
                    </View>
                )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor: CORNFLOWER_BLUE,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        backgroundColor: PALE_BLUE,
        // borderWidth: 2,
        // borderColor: DARK_BEIGE,

    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: PEACH,
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
        color: CREAM,
        marginBottom: 4,
    },
    titleText: {
        fontSize: 14,
        fontWeight: '600',
        color: CORNFLOWER_BLUE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnatureregular,
    },
    nameContainer: {
        flexDirection: 'row',
        flex: 1,

    },
    nameText: {
        fontSize: 30,
        fontWeight: '600',
        color: CORNFLOWER_BLUE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnaturebold,

        // fontFamily: CustomFonts.perfectbarista,
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

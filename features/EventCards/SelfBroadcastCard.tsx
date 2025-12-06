import { DEV_FLAG } from "@/environment";
import {
    useAcceptBroadcastMutation,
    useRejectBroadcastMutation
} from "@/services/offersApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CHARTREUSE, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteOfferOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedOfferType } from "../Offers/types";

interface MyClaimedBroadcastOfferCardProps {
    offer: ProcessedOfferType;
    refresh: () => void;
}

export default function SelfBroadcastCard({
    offer,
    refresh
}: MyClaimedBroadcastOfferCardProps): React.JSX.Element {
    console.log ("SELF BROADCAST CARD", offer);
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    const [acceptBroadcast] = useAcceptBroadcastMutation();
    const [rejectBroadcast] = useRejectBroadcastMutation();

    const [isAccepted, setIsAccepted] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const offerId = offer.id;
    const broadcastMetadata = offer.meeting?.broadcastMetadata;
    const subState = broadcastMetadata?.subState;

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

    const handleCancel = async () => {
        try {
            setIsRejecting(true);
            await rejectBroadcast({ userId, offerId }).unwrap();
            dispatch(deleteOfferOptimistic(offerId));
            // RTK Query will auto-refresh via cache invalidation
        } catch (error) {
            console.error("Error canceling broadcast claim:", error);
            alert('Failed to cancel claim. Please try again.');
            setIsRejecting(false);
        }
    };

    const getFromName = () => {
        return offer.meeting?.userFromId || 'Unknown';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.typeIndicator}>
                    <Text style={styles.typeText}>SELF BROADCAST CARD</Text>
                </View>

                {subState === 'PENDING_CLAIMED' && !isAccepted && (
                    <View style={styles.buttonContainer}>
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
                            onPress={handleCancel}
                            style={styles.rejectButton}
                            disabled={isRejecting}
                        >
                            {isRejecting ? (
                                <ActivityIndicator size="small" color="red" />
                            ) : (
                                <Text style={styles.rejectButtonText}>CANCEL</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {(subState === 'CLAIMED' || isAccepted) && (
                    <View style={styles.acceptedLabel}>
                        <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                )}
            </View>

            <Text style={styles.timeText}>{getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}</Text>

            <Text style={styles.nameText}>from: {getFromName()}</Text>

            <Text style={styles.statusText}>
                {subState === 'PENDING_CLAIMED' ? 'Pending your acceptance' : 'You claimed this broadcast'}
            </Text>

            <Text>Expires in: {offer.displayExpiresAt}</Text>
            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {offer.id.substring(0, 4)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: CHARTREUSE,
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
        marginBottom: 4,
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

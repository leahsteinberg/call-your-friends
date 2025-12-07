// TO BE DELETED (but ask before you delete it)


import { DEV_FLAG } from "@/environment";
import { BRIGHT_BLUE, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ProcessedOfferType } from "../Offers/types";

interface OtherMeetingBroadcastCardProps {
    offer: ProcessedOfferType;
}

export default function OLD_OtherMeetingBroadcastCard({
    offer
}: OtherMeetingBroadcastCardProps): React.JSX.Element {
    const broadcastMetadata = offer.meeting?.broadcastMetadata;
    const subState = broadcastMetadata?.subState;

    const getFromName = () => {
        return offer.meeting?.userFrom?.name || 'Unknown';
    };

    const getStatusMessage = () => {
        if (subState === 'PENDING_CLAIMED') {
            return 'Someone else is trying to accept this';
        }
        return 'This broadcast has been claimed by someone else';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.typeIndicator}>
                    <Text style={styles.typeText}>BROADCAST</Text>
                </View>

                <View style={styles.claimedLabel}>
                    <Text style={styles.claimedText}>
                        {subState === 'PENDING_CLAIMED' ? 'Pending' : 'Claimed'}
                    </Text>
                </View>
            </View>

            <Text style={styles.timeText}>{getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}</Text>

            <Text style={styles.nameText}>from: {getFromName()}</Text>

            <Text style={styles.statusMessage}>{getStatusMessage()}</Text>

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
        opacity: 0.7,
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
    statusMessage: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: 'monospace',
    },
    claimedLabel: {
        backgroundColor: '#999',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    claimedText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
    },
});

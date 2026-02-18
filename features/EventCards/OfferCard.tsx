import Avatar from "@/components/Avatar/Avatar";
import { EventCard } from "@/components/EventCard/EventCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptOfferMutation, useRejectOfferMutation } from "@/services/offersApi";
import { BURGUNDY, CREAM, PALE_BLUE } from "@/styles/styles";
import { OPEN_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { formatTimeOnly, formatTimezone, getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addOfferRollback, deleteOfferOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedOfferType } from "../Offers/types";
import NewTimeButton from "./NewTimeButton";

const AVATAR_SIZE = 52;

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
            dispatch(deleteOfferOptimistic(offerId));
            try {
                await rejectOffer({ userId, offerId }).unwrap();
                setIsRejecting(false);
            } catch (apiError) {
                dispatch(addOfferRollback(offer));
                throw apiError;
            }
        } catch (error) {
            console.error("Error rejecting offer:", error);
            alert('Failed to reject offer. The item has been restored.');
            setIsRejecting(false);
        }
    };

    const fromUser = offer.meeting?.userFrom;

    return (
        <EventCard backgroundColor={PALE_BLUE}>
            <View style={styles.heroRow}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarRow}>
                        {fromUser && (
                            <Avatar name={fromUser.name} avatarUrl={fromUser.avatarUrl} size={AVATAR_SIZE} />
                        )}
                    </View>
                    {fromUser?.name && (
                        <Text style={styles.avatarName} numberOfLines={1}>
                            {fromUser.name}
                        </Text>
                    )}
                </View>
                <View style={styles.heroRight}>
                    {offer.offerState === OPEN_OFFER_STATE && (
                        <View style={styles.iconButtonRow}>
                            <TouchableOpacity
                                onPress={handleAcceptOffer}
                                disabled={isAccepting || isRejecting}
                                style={[styles.iconButton, styles.iconButtonAccept]}
                            >
                                {isAccepting
                                    ? <ActivityIndicator size="small" color={CREAM} />
                                    : <IconSymbol name="checkmark" size={14} color={CREAM} />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleRejectOffer}
                                disabled={isAccepting || isRejecting}
                                style={[styles.iconButton, styles.iconButtonCancel]}
                            >
                                {isRejecting
                                    ? <ActivityIndicator size="small" color="#262626" />
                                    : <IconSymbol name="xmark" size={14} color="#262626" />
                                }
                            </TouchableOpacity>
                        </View>
                    )}
                    <Text style={styles.heroTime}>
                        {formatTimeOnly(offer.scheduledFor)}
                    </Text>
                    <Text style={styles.timezoneText}>
                        {formatTimezone(offer.scheduledFor)}
                    </Text>
                </View>
            </View>

            <View style={styles.footerRow}>
                <Text style={styles.dateText}>
                    {getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}
                </Text>

                <View style={styles.actionsRow}>
                    <NewTimeButton meetingId={offer.meetingId} scheduledFor={offer.scheduledFor} textColor="#262626" />
                </View>
            </View>

            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {offer.id.substring(0, 4)}</Text>
            )}
        </EventCard>
    );
}

const styles = StyleSheet.create({
    heroRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    avatarSection: {
        gap: 4,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarName: {
        fontSize: 12,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(0,0,0,0.5)',
    },
    heroTime: {
        fontSize: 28,
        fontWeight: '700',
        color: '#262626',
        fontFamily: CustomFonts.ztnaturebold,
        letterSpacing: -0.5,
    },
    timezoneText: {
        fontSize: 11,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(0,0,0,0.5)',
        letterSpacing: 0.3,
        marginTop: -4,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(0,0,0,0.5)',
        flex: 1,
    },
    heroRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    iconButtonRow: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonAccept: {
        backgroundColor: BURGUNDY,
    },
    iconButtonCancel: {
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});

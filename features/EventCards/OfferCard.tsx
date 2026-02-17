import Avatar from "@/components/Avatar/Avatar";
import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useAcceptOfferMutation, useRejectOfferMutation } from "@/services/offersApi";
import { CREAM, PALE_BLUE } from "@/styles/styles";
import { OPEN_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getTargetUserNames } from "@/utils/nameStringUtils";
import { formatTimeOnly, getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addOfferRollback, deleteOfferOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { ProcessedOfferType } from "../Offers/types";
import MeetingMediaSection from "./MeetingMediaSection";
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

    const getFromName = () => {
        return offer.meeting?.userFrom?.name || 'Unknown';
    };

    const strings = eventCardText.open_offer;
    const targetUserName = offer.meeting ? getTargetUserNames(offer.meeting) : null;
    const fromUser = offer.meeting?.userFrom;

    return (
        <EventCard backgroundColor={PALE_BLUE}>
            {/* Hero row: Avatar + Time */}
            <View style={styles.heroRow}>
                <View style={styles.avatarRow}>
                    {fromUser && (
                        <Avatar name={fromUser.name} avatarUrl={fromUser.avatarUrl} size={AVATAR_SIZE} />
                    )}
                </View>
                <Text style={styles.heroTime}>
                    {formatTimeOnly(offer.scheduledFor)}
                </Text>
            </View>

            {/* Context: who wants to talk */}
            <Text style={styles.contextText}>
                {strings.nameText!(getFromName(), displayTimeDifference(offer.meeting?.scheduledFor ?? offer.scheduledFor))}
                {targetUserName && ` \u2192 ${targetUserName}`}
            </Text>

            {/* Description */}
            <Text style={styles.descriptionText}>
                {strings.mainText!(getFromName(), displayTimeDifference(offer.scheduledFor))}
            </Text>

            {/* Photo + note */}
            <MeetingMediaSection
                meetingId={offer.meetingId}
                photoUrl={offer.meeting?.photoUrl}
                textContent={offer.meeting?.textContent}
                scheme="light"
            />

            {/* Footer: date + actions */}
            <View style={styles.footerRow}>
                <Text style={styles.dateText}>
                    {getDisplayDate(offer.scheduledFor, offer.displayScheduledFor)}
                </Text>

                <View style={styles.actionsRow}>
                    <NewTimeButton meetingId={offer.meetingId} scheduledFor={offer.scheduledFor} textColor="#262626" />
                    {offer.offerState === OPEN_OFFER_STATE && (
                        <>
                            <EventCard.Button
                                onPress={handleAcceptOffer}
                                loading={isAccepting}
                                variant="primary"
                                size="small"
                            >
                                <Text style={styles.acceptButtonText}>
                                    {strings.acceptButtonText!()}
                                </Text>
                            </EventCard.Button>

                            <EventCard.Button
                                onPress={handleRejectOffer}
                                loading={isRejecting}
                                variant="danger"
                                size="small"
                            >
                                <Text style={styles.rejectButtonText}>
                                    {strings.rejectButtonText!()}
                                </Text>
                            </EventCard.Button>
                        </>
                    )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroTime: {
        fontSize: 28,
        fontWeight: '700',
        color: '#262626',
        fontFamily: CustomFonts.ztnaturebold,
        letterSpacing: -0.5,
    },
    contextText: {
        fontSize: 15,
        fontFamily: CustomFonts.ztnaturemedium,
        color: '#262626',
        lineHeight: 20,
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(0,0,0,0.5)',
        marginBottom: 10,
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
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptButtonText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    rejectButtonText: {
        fontSize: 12,
        color: CREAM,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});

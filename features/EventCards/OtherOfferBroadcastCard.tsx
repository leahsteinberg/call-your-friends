import { eventCardText } from "@/constants/event_card_strings";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import {
    useAcceptOfferMutation,
    useRejectOfferMutation
} from "@/services/offersApi";
import { BOLD_BROWN, BOLD_ORANGE, BRIGHT_GREEN, BURGUNDY, CHOCOLATE_COLOR, CREAM, PALE_BLUE } from "@/styles/styles";
import { OPEN_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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


    const renderButtons = () => {
        if (offer.offerState !== OPEN_OFFER_STATE) {
            return null;
        }

        return (
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleAccept}
                    style={styles.acceptButton}
                    disabled={isAccepting}
                >
                    {isAccepting ? (
                        <ActivityIndicator size="small" color="green" />
                    ) : (
                        <Text style={styles.acceptButtonText}>{strings.acceptButtonText!()}</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.outerContainer}>
        <TouchableOpacity
            onPress={handleAccept}
            disabled={isAccepting}
        >
        <View style={styles.container}>

            <View style={styles.header}>
                <View style={styles.nameContainer}>
                    <Text style={styles.titleText}>{strings.nameText!(getFromName())}</Text>
                </View>
            </View>
            <View style={styles.content}>
                <Text style={styles.descriptionText}>{strings.mainText!(getFromName())}</Text>
                <Text style={styles.subText}>{strings.hint(getFromName())}</Text>
            </View>
        </View>
        </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: CARD_LOWER_MARGIN,
    },
    container: {
        borderRadius: 8,
        padding: 16,
        paddingBottom: 10,
        backgroundColor: BOLD_ORANGE,
        minHeight: CARD_MIN_HEIGHT,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameContainer: {
        flexDirection: 'row',
    },
    topRightContainer: {
        flexDirection: 'column',
        
    },
    titleText: {
        fontSize: 28,
        fontWeight: '600',
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
    },
    descriptionText: {
        fontSize: 20,
        color: BOLD_BROWN,
        fontFamily: CustomFonts.ztnaturemedium,
        opacity: 0.8,
    },

    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: PALE_BLUE,
        marginBottom: 4,
    },
    // titleText: {
    //     fontSize: 14,
    //     fontWeight: '600',
    //     color: CORNFLOWER_BLUE,
    //     marginBottom: 4,
    //     fontFamily: CustomFonts.ztnatureregular,
    // },
    flowerContainerRelative: {
        //alignSelf: 'flex-start',
        position: 'absolute',
        marginTop: -30,
       marginLeft: -40,
      marginBottom: 0,
        //backgroundColor: PALE_BLUE,
        //zIndex: -1,
    },
    nameText: {
        fontSize: 30,
        fontWeight: '600',
        color: BOLD_BROWN,
        fontFamily: CustomFonts.ztnaturebold,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    animationContainer: {
        marginTop: 10,
    },
    acceptButton: {
        borderRadius: 10,
        backgroundColor: BURGUNDY,
        padding: 5,
    },
    acceptButtonText: {
        color: CREAM,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturebold,

    },
    rejectButton: {
        borderRadius: 4,

    },
    rejectButtonText: {
        color: BURGUNDY,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    acceptedLabel: {
        backgroundColor: BRIGHT_GREEN,

        borderRadius: 4,

    },
    acceptedText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',

    },
    loadingText: {
        fontSize: 28,
        fontWeight: '600',
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
    },
});

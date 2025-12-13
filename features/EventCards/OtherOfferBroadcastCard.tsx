import FlowerBlob from '@/assets/images/flower-blob.svg';
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import {
    useAcceptBroadcastMutation,
    useRejectBroadcastMutation,
    useTryAcceptBroadcastMutation
} from "@/services/offersApi";
import { BRIGHT_GREEN, BURGUNDY, CHOCOLATE_COLOR, CORNFLOWER_BLUE, CREAM, ORANGE, PALE_BLUE } from "@/styles/styles";
import { OPEN_OFFER_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { deleteOfferOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedOfferType } from "../Offers/types";

interface OtherOfferBroadcastCardProps {
    offer: ProcessedOfferType;
}

export default function OtherOfferBroadcastCard({ offer }: OtherOfferBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const flowerRotation = useSharedValue(240);

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
            // Wait for high-five animation to complete before accepting
            setIsAccepted(true);

            await new Promise(resolve => setTimeout(resolve, 1500));
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
                <Text style={styles.acceptButtonText}>Claim call</Text>
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
                <Text style={styles.acceptButtonText}>Call</Text>
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

    const renderButtons = () => {
        return ( 
            <View>
            {offer.offerState === OPEN_OFFER_STATE && !isAccepted && (
            <View style={styles.buttonContainer}>

                {!hasTried ? (
                    <>
                        {renderTryAcceptButton()}
                    </>
                ) : (
                    <>
                        {/* After successful try: ACCEPT + CANCEL */}
                        {renderAcceptButton()}
                        {renderRejectButton('Cancel call')}
                    </>
                )}
        </View>
            )}
            </View>
            )

    }

    // Determine animation stage based on state
    const getAnimationStage = (): 'initial' | 'moving' | 'complete' => {
        if (isClaimedBySelf || isAccepted) {
            return 'complete';
        } else if (isPendingClaimedBySelf || hasTried) {
            return 'moving';
        } else {
            return 'initial';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.nameContainer}>
                    <Animated.View style={[styles.flower, animatedFlowerStyle]}>
                        <FlowerBlob
                            fill={ORANGE}
                        />
                    </Animated.View>
                    <Text style={styles.nameText}>{getFromName()}</Text>
                </View>
                <View style={styles.topRightContainer}>
                    {renderButtons()}

                </View>
            </View>
            <View style={styles.content}> 
                <Text style={styles.titleText}>{eventCardText.broadcast_other_open.title(getFromName())}</Text>
            </View>
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
        overflow: 'visible',
        // flexDirection: 'row',
        // justifyContent: 'space-between',

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

    flower: {
        height:65,
        width: 65,
        marginTop: -30,
        marginLeft: -25,
        position: 'absolute',

    },
    nameText: {
        fontSize: 30,
        fontWeight: '600',
        color: CORNFLOWER_BLUE,
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
        // alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 8,
    },
    animationContainer: {
        // position: 'absolute',
        // marginLeft: -100,
        marginTop: 10,

    },
    acceptButton: {
        //borderWidth: 1,
        borderRadius: 4,
        //backgroundColor: CREAM,

    },
    acceptButtonText: {
        color: ORANGE,
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
});

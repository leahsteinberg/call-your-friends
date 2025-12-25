import AnimatedText from "@/components/AnimatedText";
import FriendBadgeSelector from "@/components/FriendBadgeSelector";
import { eventCardText } from "@/constants/event_card_strings";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { startBroadcast } from "@/features/Broadcast/broadcastSlice";
import type { Friend } from "@/features/Contacts/types";
import { useGetFriendsMutation } from "@/services/contactsApi";
import { useBroadcastNowMutation } from "@/services/meetingApi";
import { BOLD_BLUE, BOLD_BROWN, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

export default function BroadcastNowCard(): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [broadcastNow] = useBroadcastNowMutation();
    const [isStarting, setIsStarting] = useState(false);
    const strings = eventCardText.broadcast_now_card;

    // Friends state and API
    const [friends, setFriends] = useState<Friend[]>([]);
    const [getFriends] = useGetFriendsMutation();

    // Fetch friends on component mount
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friendsResult = await getFriends({ id: userId }).unwrap();
                setFriends(friendsResult || []);
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };
        fetchFriends();
    }, [userId]);

    // Pulse animation for loading state (Option A)
    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (isStarting) {
            // Start subtle pulse when loading
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1,
                false
            );
        } else {
            // Reset to normal
            pulseOpacity.value = withTiming(1, { duration: 300 });
        }
    }, [isStarting]);

    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value
    }));

    const handleStartBroadcast = async () => {
        try {
            setIsStarting(true);
            // Wait for API to succeed before updating Redux
            await broadcastNow({ userId }).unwrap();
            // Now update Redux state
            dispatch(startBroadcast());
            // RTK Query will auto-refresh via cache invalidation
            // The card will disappear and be replaced by SelfBroadcastCard
        } catch (error) {
            console.error("Error starting broadcast:", error);
            alert('Failed to start broadcast. Please try again.');
            setIsStarting(false);
        }
    };

    // Handle friend selection from badge selector
    const handleFriendsSelect = (userIds: string[]) => {
        console.log('Selected friends for broadcast:', userIds);
        // TODO: Implement broadcast to specific friends
        // This could trigger a direct broadcast to the selected friends
        // Or initiate a call/meeting with them
    };

    return (
        <View style={styles.outerContainer}>
            {/* Friend Badge Selector - on the card */}
            <FriendBadgeSelector
                friends={friends}
                onSelectFriends={handleFriendsSelect}
                position="bottom-left"
            />

            <TouchableOpacity
                onPress={handleStartBroadcast}
                disabled={isStarting}
                style={styles.container}
            >
                <Animated.View style={[animatedCardStyle]}>
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            {/* Option B: Change title when loading */}
                            <Text style={styles.titleText}>
                                {strings.mainText()}
                            </Text>
                            {isStarting &&
                                <AnimatedText
                                    text="..."
                                    style={styles.loadingText}
                                    duration={300}
                                    staggerDelay={500}
                                />
                            }
                        </View>
                        <View>
                            {/* <View style={styles.broadcastButton}>
                            <View style={styles.broadcastButtonContainer}>
                                <TouchableOpacity
                                    onPress={handleStartBroadcast}
                                    style={[styles.startButton, isStarting && styles.startButtonDisabled]}
                                    disabled={isStarting}
                                >
                                    {!isStarting && (
                                        <Text style={styles.startButtonText}>{strings.acceptButtonText!()}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            </View> */}
                        </View>
                    </View>
                    {!isStarting && (
                        <View>
                            <Text style={styles.descriptionText}>
                                {strings.title()}
                            </Text>
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: CARD_LOWER_MARGIN,
    },
    container: {
        backgroundColor: BOLD_BLUE,
        borderRadius: 8,
        padding: 18,
        paddingBottom: 18,
        minHeight: CARD_MIN_HEIGHT,
    },
    titleContainer: {
        flexDirection: 'row',
    },
    broadcastButton: {
        position: 'absolute',
        marginTop: -50,
        marginLeft: -40,
        backgroundColor: BOLD_BLUE,
        paddingBottom: 15,
        paddingTop: 5,
        borderRadius: 10,
    },
    broadcastButtonContainer: {
        alignSelf: 'flex-start',

    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        fontFamily: CustomFonts.ztnaturebold,
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
    startButton: {
        minWidth: 50,
        alignItems: 'center',
        // justifyContent: 'flex-start',
        //alignContent: 'flex-start',
        borderRadius: 10,
        //backgroundColor: ORANGE,
    },
    startButtonDisabled: {
        opacity: 0.6,
    },
    startButtonText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    loadingTextContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
    },

    loadingText: {
        fontSize: 28,
        fontWeight: '600',
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
    },

});

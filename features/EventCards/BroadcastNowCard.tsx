import AnimatedText from "@/components/AnimationComponents/AnimatedText";
import FriendBadgeSelector, { FriendBadgeSelectorRef } from "@/components/CardActionDecorations/FriendBadgeSelector";
import VibeButton from "@/components/CardActionDecorations/VibeButton";
import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { startBroadcast } from "@/features/Broadcast/broadcastSlice";
import type { Friend } from "@/features/Contacts/types";
import { useGetFriendsMutation } from "@/services/contactsApi";
import { useBroadcastNowMutation } from "@/services/meetingApi";
import { BOLD_BLUE, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { determineTargetType } from "@/utils/broadcastUtils";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

export default function BroadcastNowCard(): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [broadcastNow] = useBroadcastNowMutation();
    const [isStarting, setIsStarting] = useState(false);
    const strings = eventCardText.broadcast_now_card;
    const [selectedVibe, setSelectedVibe] = useState<string | null>(null);


    // Friends state and API
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [getFriends] = useGetFriendsMutation();
    const friendSelectorRef = useRef<FriendBadgeSelectorRef>(null);

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

    const handleVibeSelect = (vibeId: string | null) => {
        console.log(`Vibe selected: ${vibeId}`);
        setSelectedVibe(vibeId);
        // TODO: Send vibe to server
    };

    const getMainText = () => {
        if (selectedFriendIds.length > 0) {
            const selectedFriends = friends.filter(friend =>
                selectedFriendIds.includes(friend.id)
            );
            const selectedFriendNames = selectedFriends.map((f) => f.name);

            return `Share with ${selectedFriendNames[0]}${selectedFriendNames.length > 1 ? ` and ${selectedFriendNames.length-1} more friend` : ``}`;
        }
        return strings.mainText();
    }

    const handleStartBroadcast = async () => {
        try {
            setIsStarting(true);
            const targetType = determineTargetType(selectedFriendIds);
 
            // Wait for API to succeed before updating Redux
            console.log("selecteddd", selectedFriendIds)
            await broadcastNow({
                userId,
                targetUserIds: selectedFriendIds.length > 0 ? selectedFriendIds : undefined,
                targetType,
                intentLabel: selectedVibe,
            }).unwrap();

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
        setSelectedFriendIds(userIds);
    };

    return (
        <View style={{ position: 'relative' }}>
            {/* Friend selector floats outside card */}
            <FriendBadgeSelector
                ref={friendSelectorRef}
                friends={friends}
                onSelectFriends={handleFriendsSelect}
                position="bottom-right"
                selectedFriendIds={selectedFriendIds}
            />

            {/* Wrap EventCard in Animated.View for pulse animation */}
            <Animated.View style={[animatedCardStyle]}>
                <EventCard
                    backgroundColor={BOLD_BLUE}
                    onPress={handleStartBroadcast}
                    disabled={isStarting}
                >
                    <EventCard.Header>
                        <EventCard.Row gap={0}>
                            <EventCard.Title>{getMainText()}</EventCard.Title>
                            {isStarting && (
                                <AnimatedText
                                    text="..."
                                    style={{ fontSize: 28, color: CREAM, fontWeight: '600' }}
                                    duration={300}
                                    staggerDelay={500}
                                />
                            )}
                        </EventCard.Row>
                    </EventCard.Header>

                    {!isStarting && (
                        <EventCard.Body>
                            <EventCard.Description>
                                {strings.title()}
                            </EventCard.Description>
                            <VibeButton
                                selectedVibe={selectedVibe}
                                onVibeSelect={handleVibeSelect}
                            />
                        </EventCard.Body>
                    )}
                </EventCard>
            </Animated.View>
        </View>
    );
}

// All styles now provided by EventCard components

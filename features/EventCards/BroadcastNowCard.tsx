import AnimatedText from "@/components/AnimationComponents/AnimatedText";
import FriendBadgeSelector from "@/components/CardActionDecorations/FriendBadgeSelector";
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
import { getDisplayNameList } from "@/utils/nameStringUtils";
import React, { useEffect, useState } from "react";
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


    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [getFriends] = useGetFriendsMutation();

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

    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (isStarting) {
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
        setSelectedVibe(vibeId);
    };

    const getMainText = () => {
        const selectedFriends = friends.filter(friend =>
            selectedFriendIds.includes(friend.id)
        );
        const displayNames = getDisplayNameList(selectedFriends);
        //return `Share with ${displayNames}`;
        return 'Enter call me mode'
    }

    const handleStartBroadcast = async () => {
        try {
            setIsStarting(true);
            const targetType = determineTargetType(selectedFriendIds);
 
            await broadcastNow({
                userId,
                targetUserIds: selectedFriendIds.length > 0 ? selectedFriendIds : undefined,
                targetType,
                intentLabel: selectedVibe,
            }).unwrap();

            dispatch(startBroadcast());
        } catch (error) {
            alert('Failed to start broadcast. Please try again.');
            setIsStarting(false);
        }
    };

    const handleFriendsSelect = (userIds: string[]) => {
        setSelectedFriendIds(userIds);
    };

    return (
        <View style={{ position: 'relative' }}>
            <FriendBadgeSelector
                friends={friends}
                onSelectFriends={handleFriendsSelect}
                position="bottom-right"
                selectedFriendIds={selectedFriendIds}
            />

            <Animated.View style={[animatedCardStyle]}>
                <EventCard
                    backgroundColor={BOLD_BLUE}
                    onPress={handleStartBroadcast}
                    disabled={isStarting}
                >
                    <EventCard.Pill backgroundColor={'transparent'} textColor={CREAM}>
                        TAP TO BEGIN
                    </EventCard.Pill>
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

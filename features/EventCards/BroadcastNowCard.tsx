import AnimatedText from "@/components/AnimationComponents/AnimatedText";
import FriendBadgeSelector from "@/components/CardActionDecorations/FriendBadgeSelector";
import VibeButton from "@/components/CardActionDecorations/VibeButton";
import { EventCard } from "@/components/EventCard/EventCard";
import { eventCardText } from "@/constants/event_card_strings";
import { useBroadcastSettings } from "@/features/Broadcast/BroadcastSettingsContext";
import { BOLD_BLUE, CREAM } from "@/styles/styles";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export default function BroadcastNowCard(): React.JSX.Element {
    const {
        selectedVibe,
        selectedFriendIds,
        friends,
        isStarting,
        setSelectedVibe,
        setSelectedFriendIds,
        handleStartBroadcast,
    } = useBroadcastSettings();

    const strings = eventCardText.broadcast_now_card;

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
        return 'Enter call me mode'
    }

    const onStartBroadcast = async () => {
        try {
            await handleStartBroadcast();
        } catch (error) {
            alert('Failed to start broadcast. Please try again.');
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
                    onPress={onStartBroadcast}
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

import FriendBadgeSelector from "@/components/CardActionDecorations/FriendBadgeSelector";
import VibeButton from "@/components/CardActionDecorations/VibeButton";
import { EventCard } from "@/components/EventCard/EventCard";
import GoButton from "@/components/GoButton";
import { useBroadcastSettings } from "@/features/Broadcast/BroadcastSettingsContext";
import { BOLD_BLUE } from "@/styles/styles";
import React, { useEffect } from "react";
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
        <Animated.View style={[animatedCardStyle]}>
            <EventCard
                backgroundColor={BOLD_BLUE}
                onPress={onStartBroadcast}
                disabled={isStarting}
            >


                <GoButton
                    onPress={onStartBroadcast}
                    disabled={isStarting}
                    text={isStarting ? "Starting..." : "Call Me"}
                />

                {!isStarting && (
                    <EventCard.Body>
                        <VibeButton
                            selectedVibe={selectedVibe}
                            onVibeSelect={handleVibeSelect}
                        />
                    </EventCard.Body>
                )}
            <EventCard.Decoration position="bottom-right">
                    <FriendBadgeSelector
                        friends={friends}
                        onSelectFriends={handleFriendsSelect}
                        selectedFriendIds={selectedFriendIds}
                    />
                </EventCard.Decoration>

            </EventCard>
        </Animated.View>
    );
}

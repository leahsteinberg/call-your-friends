import FriendBadgeSelector from "@/components/CardActionDecorations/FriendBadgeSelector";
import VibeButton from "@/components/CardActionDecorations/VibeButton";
import CurvedCutoutBand from "@/components/CurvedCutoutBand";
import { EventCard } from "@/components/EventCard/EventCard";
import GoButton from "@/components/GoButton";
import { useBroadcastSettings } from "@/features/Broadcast/BroadcastSettingsContext";
import { CREAM } from "@/styles/styles";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export default function BroadcastNowCard(): React.JSX.Element {
    const {
        selectedVibe,
        selectedFriendIds,
        friends,
        isStarting,
        isCustomizing,
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
                backgroundColor="transparent"
                onPress={onStartBroadcast}
                disabled={isStarting}
                variant="solid"
            >
                <LinearGradient
                    colors={[CREAM, CREAM + '80', CREAM + '00']}
                    locations={[0, 0.67, 1]}
                    style={gradientStyles.background}
                />

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

                <CurvedCutoutBand
                    visible={isCustomizing}
                    onIcon1Press={() => console.log('Icon 1 pressed')}
                    onIcon2Press={() => console.log('Icon 2 pressed')}
                    onIcon3Press={() => console.log('Icon 3 pressed')}
                />

            </EventCard>
        </Animated.View>
    );
}

const gradientStyles = StyleSheet.create({
    background: {
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
    },
});
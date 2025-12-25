import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface RightSwipeProps {
    children: React.ReactNode;
    onSwipeComplete: () => void;
    threshold?: number; // pixels to trigger the action
    maxDistance?: number; // maximum swipe distance in pixels
    fadeOnSwipe?: boolean; // whether to fade slightly as it moves
}

/**
 * RightSwipe - Reusable right-swipe gesture component
 *
 * Wraps card content with right-swipe gesture detection. When the user swipes
 * right past the threshold, triggers a callback and smoothly slides back.
 *
 * Usage:
 * ```tsx
 * <RightSwipe onSwipeComplete={() => console.log('Swiped!')}>
 *   <View>Your card content here</View>
 * </RightSwipe>
 * ```
 */
export default function RightSwipe({
    children,
    onSwipeComplete,
    threshold = 50,
    maxDistance = 70,
    fadeOnSwipe = true,
}: RightSwipeProps): React.JSX.Element {
    const translateX = useSharedValue(0);

    // Gesture handler for right swipe
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            // Only allow right swipe up to maxDistance
            translateX.value = Math.max(0, Math.min(maxDistance, e.translationX));
        })
        .onEnd((e) => {
            if (e.translationX > threshold) {
                // Swipe completed - trigger callback and slide back smoothly
                runOnJS(onSwipeComplete)();
            }

            // Always slide back to original position with slight deceleration
            translateX.value = withTiming(0, {
                duration: 200,
                easing: Easing.out(Easing.ease)
            });
        });

    // Animated style for the swipe effect
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: fadeOnSwipe
            ? 1 - (translateX.value / maxDistance) * 0.3
            : 1,
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>
                {children}
            </Animated.View>
        </GestureDetector>
    );
}

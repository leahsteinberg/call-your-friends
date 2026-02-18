import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

interface BubbleConfig {
    SVG: React.ComponentType<any>;
    size: number;
    color: string;
    position: { top?: number; bottom?: number; left?: number | string; right?: number };
    scaleDuration?: number;
    translateDuration?: number;
    rotateDuration?: number;
}

interface PulsingLoaderProps {
    bubbles: BubbleConfig[];
    containerSize?: { width: number; height: number };
}

export default function PulsingLoader({ bubbles, containerSize = { width: 200, height: 190 } }: PulsingLoaderProps): React.JSX.Element {
    const createBubbleAnimation = (index: number) => {
        const scale = useSharedValue(1);
        const translateX = useSharedValue(0);
        const translateY = useSharedValue(0);
        const rotate = useSharedValue(0);

        const config = bubbles[index];
        const baseOffset = index * 200; // Stagger animations

        useEffect(() => {
            // Scale animation
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.15 + index * 0.05, {
                        duration: (config.scaleDuration || 1200) + baseOffset,
                        easing: Easing.inOut(Easing.ease)
                    }),
                    withTiming(1, {
                        duration: (config.scaleDuration || 1200) + baseOffset,
                        easing: Easing.inOut(Easing.ease)
                    })
                ),
                -1,
                false
            );

            // Translate X animation
            translateX.value = withRepeat(
                withSequence(
                    withTiming(-8 + index * 2, { duration: (config.translateDuration || 1500) + baseOffset }),
                    withTiming(8 - index * 2, { duration: (config.translateDuration || 1500) + baseOffset })
                ),
                -1,
                true
            );

            // Translate Y animation
            translateY.value = withRepeat(
                withSequence(
                    withTiming(-6 + index * 2, { duration: (config.translateDuration || 1800) + baseOffset + 300 }),
                    withTiming(6 - index * 2, { duration: (config.translateDuration || 1800) + baseOffset + 300 })
                ),
                -1,
                true
            );

            // Rotate animation
            rotate.value = withRepeat(
                withSequence(
                    withTiming(-5 + index * 2, { duration: (config.rotateDuration || 2000) + baseOffset }),
                    withTiming(5 + index * 3, { duration: (config.rotateDuration || 2000) + baseOffset })
                ),
                -1,
                true
            );
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
                { rotate: `${rotate.value}deg` }
            ],
        }));

        return { animatedStyle, scale, translateX, translateY, rotate };
    };

    const bubbleAnimations = bubbles.map((_, index) => createBubbleAnimation(index));

    return (
        <View style={styles.container}>
            <View style={[styles.bubbleCluster, { width: containerSize.width, height: containerSize.height }]}>
                {bubbles.map((bubble, index) => {
                    const { animatedStyle } = bubbleAnimations[index];
                    const SVGComponent = bubble.SVG;

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.bubble,
                                {
                                    top: bubble.position.top,
                                    bottom: bubble.position.bottom,
                                    left: bubble.position.left,
                                    right: bubble.position.right,
                                },
                                animatedStyle
                            ]}
                        >
                            <SVGComponent width={bubble.size} height={bubble.size} fill={bubble.color} />
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    bubbleCluster: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bubble: {
        position: 'absolute',
    },
});
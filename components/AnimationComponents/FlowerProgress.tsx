import FlowerBlob from "@/assets/images/flower-blob.svg";
import { ORANGE, PALE_BLUE, PEACH } from "@/styles/styles";
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface FlowerProgressProps {
    stage: number; // 0 = not claimed, 0.5 = claimed, 1 = fully called
    size?: number; // Default 65
}

export default function FlowerProgress({
    stage,
    size = 65
}: FlowerProgressProps): React.JSX.Element {
    const progress = useSharedValue(0);
    const pulse = useSharedValue(1);

    // Update progress when stage changes
    useEffect(() => {
        progress.value = withSpring(stage, {
            damping: 15,
            stiffness: 100
        });
    }, [stage]);

    // Pulse animation when fully bloomed
    useEffect(() => {
        if (stage === 1) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            pulse.value = withTiming(1, { duration: 300 });
        }
    }, [stage]);

    const animatedFlowerStyle = useAnimatedStyle(() => {
        // Scale: closed bud (0.5) → half open (0.75) → full bloom (1.0)
        const baseScale = interpolate(
            progress.value,
            [0, 0.5, 1],
            [0.5, 0.75, 1.0]
        );

        // Rotation: adds organic movement
        const rotation = interpolate(
            progress.value,
            [0, 0.5, 1],
            [0, 15, 30]
        );

        // Opacity: subtle fade in as it blooms
        const opacity = interpolate(
            progress.value,
            [0, 0.5, 1],
            [0.7, 0.85, 1.0]
        );

        // Combine base scale with pulse (only active when fully bloomed)
        const finalScale = baseScale * pulse.value;

        return {
            transform: [
                { scale: finalScale },
                { rotate: `${rotation}deg` }
            ],
            opacity
        };
    });

    // Animate color based on stage
    const getFlowerColor = () => {
        'worklet';
        // Bud → Half open → Full bloom
        const color = interpolateColor(
            progress.value,
            [0, 0.5, 1],
            [PALE_BLUE, PEACH, ORANGE]
        );
        return color;
    };

    const animatedColorStyle = useAnimatedStyle(() => ({
        // We'll pass the color as a prop, but this shows the interpolation
    }));

    // For now, determine color discretely since SVG fill is easier to change this way
    const flowerColor = stage === 0 ? PALE_BLUE : stage < 1 ? PEACH : ORANGE;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Animated.View style={[styles.flower, animatedFlowerStyle]}>
                <FlowerBlob
                    width={size}
                    height={size}
                    fill={flowerColor}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flower: {
        position: 'absolute',
    }
});

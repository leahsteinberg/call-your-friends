import FlowerBlob from "@/assets/images/flower-blob.svg";
import { CORNFLOWER_BLUE, ORANGE, PALE_BLUE, PEACH } from "@/styles/styles";
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

const AnimatedLine = Animated.createAnimatedComponent(Line);

interface BridgeProgressProps {
    stage: number; // 0 = not claimed, 0.5 = claimed, 1 = fully called
    width?: number; // Default 200
    flowerSize?: number; // Default 40
}

export default function BridgeProgress({
    stage,
    width = 200,
    flowerSize = 40
}: BridgeProgressProps): React.JSX.Element {
    const progress = useSharedValue(0);
    const leftFlowerBob = useSharedValue(0);
    const rightFlowerBob = useSharedValue(0);
    const bridgePulse = useSharedValue(1);

    const bridgeLength = width - flowerSize * 2;
    const height = flowerSize + 20;

    // Update progress when stage changes
    useEffect(() => {
        progress.value = withSpring(stage, {
            damping: 12,
            stiffness: 90
        });
    }, [stage]);

    // Subtle bobbing animation for left flower
    useEffect(() => {
        leftFlowerBob.value = withRepeat(
            withSequence(
                withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    // Subtle bobbing animation for right flower (offset timing)
    useEffect(() => {
        rightFlowerBob.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    // Pulse animation when bridge is complete
    useEffect(() => {
        if (stage === 1) {
            bridgePulse.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            bridgePulse.value = withTiming(1, { duration: 300 });
        }
    }, [stage]);

    // Left flower animation
    const leftFlowerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: leftFlowerBob.value },
            { scale: stage === 0 ? 0.9 : 1 }
        ]
    }));

    // Right flower animation
    const rightFlowerStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            progress.value,
            [0, 0.5, 1],
            [0.7, 0.85, 1]
        );

        return {
            transform: [
                { translateY: rightFlowerBob.value },
                { scale: scale * (stage === 1 ? bridgePulse.value : 1) }
            ],
            opacity: interpolate(
                progress.value,
                [0, 0.5, 1],
                [0.5, 0.75, 1]
            )
        };
    });

    // Animated bridge line
    const bridgeProps = useAnimatedProps(() => {
        const currentLength = interpolate(
            progress.value,
            [0, 1],
            [0, bridgeLength]
        );

        return {
            x2: flowerSize + currentLength,
            strokeWidth: interpolate(
                progress.value,
                [0, 0.5, 1],
                [2, 3, 4]
            )
        };
    });

    // Get colors based on stage
    const getFlowerColors = () => {
        if (stage === 0) return { left: PALE_BLUE, right: PALE_BLUE };
        if (stage < 1) return { left: PEACH, right: PALE_BLUE };
        return { left: ORANGE, right: ORANGE };
    };

    const getBridgeColor = () => {
        if (stage === 0) return PALE_BLUE;
        if (stage < 1) return PEACH;
        return CORNFLOWER_BLUE;
    };

    const colors = getFlowerColors();

    return (
        <View style={[styles.container, { width, height }]}>
            {/* Left Flower */}
            <Animated.View style={[styles.leftFlower, leftFlowerStyle]}>
                <FlowerBlob
                    width={flowerSize}
                    height={flowerSize}
                    fill={colors.left}
                />
            </Animated.View>

            {/* Bridge */}
            <Svg
                width={width}
                height={height}
                style={styles.bridge}
            >
                {/* Background line (incomplete) */}
                <Line
                    x1={flowerSize}
                    y1={height / 2}
                    x2={width - flowerSize}
                    y2={height / 2}
                    stroke={PALE_BLUE}
                    strokeWidth="2"
                    strokeDasharray="4, 4"
                    opacity={0.3}
                />

                {/* Animated bridge line (completed) */}
                <AnimatedLine
                    x1={flowerSize}
                    y1={height / 2}
                    y2={height / 2}
                    stroke={getBridgeColor()}
                    strokeLinecap="round"
                    animatedProps={bridgeProps}
                />
            </Svg>

            {/* Right Flower */}
            <Animated.View style={[styles.rightFlower, rightFlowerStyle]}>
                <FlowerBlob
                    width={flowerSize}
                    height={flowerSize}
                    fill={colors.right}
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
    bridge: {
        position: 'absolute',
    },
    leftFlower: {
        position: 'absolute',
        left: 0,
    },
    rightFlower: {
        position: 'absolute',
        right: 0,
    }
});

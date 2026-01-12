import ClapBurst from '@/assets/images/clap-burst.svg';
import HighFiveLeft from '@/assets/images/high-five-left.svg';
import HighFiveRight from '@/assets/images/high-five-right.svg';
import { ORANGE } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";

interface HighFiveAnimationProps {
    stage: 'initial' | 'moving' | 'complete';
    isAnimated: boolean;
    fill: string;
}

const scale = 1;

export default function HighFiveAnimation({ stage, isAnimated, fill }: HighFiveAnimationProps): React.JSX.Element {
    // Animation values
    const leftHandX = useSharedValue(isAnimated ? -60 : -10);
    const rightHandX = useSharedValue(isAnimated ? 60 : 10);
    const leftHandRotation = useSharedValue(isAnimated ? 0 : -5);
    const rightHandRotation = useSharedValue(isAnimated ? 0 : 5);
    const burstOpacity = useSharedValue(isAnimated ? 0 : 1);
    const burstScale = useSharedValue(isAnimated ? 10 : 1);
    const lineOpacity = useSharedValue(1);
    const lineDistance = useSharedValue(120);


    useEffect(() => {
        if (!isAnimated) {
            burstOpacity.value = withDelay(250, withTiming(1, { duration: 300 }));
            burstScale.value = withDelay(250, withSpring(1, { damping: 8, stiffness: 100 }));
            return;
        }
        if (stage === 'initial') {
            // Stage 1: Hands apart with dotted line
            leftHandX.value = withTiming(-60, { duration: 300 });
            rightHandX.value = withTiming(60, { duration: 300 });
            leftHandRotation.value = withTiming(0, { duration: 300 });
            rightHandRotation.value = withTiming(0, { duration: 300 });
            burstOpacity.value = withTiming(0, { duration: 200 });
            burstScale.value = withTiming(1, { duration: 200 });
            lineOpacity.value = withTiming(1, { duration: 300 });
        } else if (stage === 'moving') {
            // Stage 2: Hands move closer together
            leftHandX.value = withTiming(-50, { duration: 600, easing: Easing.inOut(Easing.ease) });
            rightHandX.value = withTiming(50, { duration: 600, easing: Easing.inOut(Easing.ease) });
            lineOpacity.value = withTiming(0.3, { duration: 600 });
        } else if (stage === 'complete') {
            // Stage 3: Clap animation with swing
            lineOpacity.value = withTiming(0, { duration: 200 });

            // Swing and clap motion
            leftHandX.value = withSequence(
                withTiming(-35, { duration: 150, easing: Easing.out(Easing.quad) }),
                withTiming(-10, { duration: 100, easing: Easing.in(Easing.quad) })
            );
            rightHandX.value = withSequence(
                withTiming(35, { duration: 150, easing: Easing.out(Easing.quad) }),
                withTiming(10, { duration: 100, easing: Easing.in(Easing.quad) })
            );

            // Rotation for swing effect
            leftHandRotation.value = withSequence(
                withTiming(-10, { duration: 150 }),
                withTiming(5, { duration: 100 })
            );
            rightHandRotation.value = withSequence(
                withTiming(10, { duration: 150 }),
                withTiming(-5, { duration: 100 })
            );

            // Show burst after clap
            burstOpacity.value = withDelay(250, withTiming(1, { duration: 300 }));
            burstScale.value = withDelay(250, withSpring(1, { damping: 8, stiffness: 100 }));
        }
    }, [stage]);

    const leftHandStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: leftHandX.value },
            { rotate: `${leftHandRotation.value}deg` }
        ],
    }));

    const rightHandStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: rightHandX.value },
            { rotate: `${rightHandRotation.value}deg` }
        ],
    }));

    const burstStyle = useAnimatedStyle(() => ({
        opacity: burstOpacity.value,
        transform: [{ scale: burstScale.value }],
    }));

    const lineStyle = useAnimatedStyle(() => ({
        opacity: lineOpacity.value,
    }));

    return (
        <View style={styles.container}>
            {/* Left hand */}
            <Animated.View style={[styles.hand, leftHandStyle]}>
                <HighFiveLeft fill={fill || ORANGE} width={40} height={40} />
            </Animated.View>

            {/* Dotted line connecting them */}
            {/* <Animated.View style={[styles.lineContainer, lineStyle]}>
                <Svg height="2" width="80" style={styles.line}>
                    <Line
                        x1="0"
                        y1="1"
                        x2="100"
                        y2="1"
                        stroke={ORANGE}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                </Svg>
            </Animated.View> */}

            {/* Right hand */}
            <Animated.View style={[styles.hand, rightHandStyle]}>
                <HighFiveRight fill={fill || ORANGE} width={40} height={40} />
            </Animated.View>

            {/* Clap burst - only visible when complete */}
            <Animated.View style={[styles.burst, burstStyle]}>
                <ClapBurst fill={fill || ORANGE} width={50} height={50} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 150,
        // height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    hand: {
        position: 'absolute',
        width: 30,
        height: 30,
    },
    lineContainer: {
        position: 'absolute',
        marginTop: 35,
        marginLeft: 22,
        width: 100,
        height: 2,
    },
    line: {
        position: 'absolute',
    },
    burst: {
        position: 'absolute',
        opacity: 1,
        width: 25,
        height: 25,
        marginTop: -30,
        marginLeft: -5,
    },
});

import FlowerBlob from "@/assets/images/flower-blob.svg";
import { BOLD_BLUE, BOLD_ORANGE, PEACH } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export default function PulsingFlowerLoader(): React.JSX.Element {
    const scale1 = useSharedValue(1);
    const scale2 = useSharedValue(1);
    const scale3 = useSharedValue(1);
    const scale4 = useSharedValue(1);

    const translateY = useSharedValue(0);

    useEffect(() => {
        // Staggered pulse animation for each flower
        const pulseAnimation = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        scale1.value = pulseAnimation;
        scale2.value = withDelay(150, pulseAnimation);
        scale3.value = withDelay(300, pulseAnimation);
        scale4.value = withDelay(450, pulseAnimation);

        // Gentle float animation
        translateY.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 1000 }),
                withTiming(10, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle1 = useAnimatedStyle(() => ({
        transform: [{ scale: scale1.value }, { translateY: translateY.value }],
    }));

    const animatedStyle2 = useAnimatedStyle(() => ({
        transform: [{ scale: scale2.value }, { translateY: translateY.value }],
    }));

    const animatedStyle3 = useAnimatedStyle(() => ({
        transform: [{ scale: scale3.value }, { translateY: translateY.value }],
    }));

    const animatedStyle4 = useAnimatedStyle(() => ({
        transform: [{ scale: scale4.value }, { translateY: translateY.value }],
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={animatedStyle1}>
                <FlowerBlob width={50} height={50} fill={BOLD_BLUE} />
            </Animated.View>
            <Animated.View style={animatedStyle2}>
                <FlowerBlob width={60} height={60} fill={PEACH} />
            </Animated.View>
            <Animated.View style={animatedStyle3}>
                <FlowerBlob width={55} height={55} fill={BOLD_ORANGE} />
            </Animated.View>
            <Animated.View style={animatedStyle4}>
                <FlowerBlob width={50} height={50} fill={BOLD_BLUE} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingVertical: 60,
    },
});

import FlowerBlob from "@/assets/images/flower-blob.svg";
import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, DARK_GREEN } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export default function AnimatedDotsLoader(): React.JSX.Element {
    const opacity1 = useSharedValue(0.3);
    const opacity2 = useSharedValue(0.3);
    const opacity3 = useSharedValue(0.3);
    const flowerScale = useSharedValue(1);

    useEffect(() => {
        const fadeAnimation = withRepeat(
            withSequence(
                withTiming(1, { duration: 500 }),
                withTiming(0.3, { duration: 500 })
            ),
            -1,
            false
        );

        opacity1.value = fadeAnimation;
        opacity2.value = withDelay(200, fadeAnimation);
        opacity3.value = withDelay(400, fadeAnimation);

        flowerScale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            false
        );
    }, []);

    const animatedDot1 = useAnimatedStyle(() => ({
        opacity: opacity1.value,
    }));

    const animatedDot2 = useAnimatedStyle(() => ({
        opacity: opacity2.value,
    }));

    const animatedDot3 = useAnimatedStyle(() => ({
        opacity: opacity3.value,
    }));

    const animatedFlower = useAnimatedStyle(() => ({
        transform: [{ scale: flowerScale.value }],
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={animatedFlower}>
                <FlowerBlob width={40} height={40} fill={BOLD_BLUE} />
            </Animated.View>
            <Text style={styles.text}>Loading your calls</Text>
            <View style={styles.dotsContainer}>
                <Animated.Text style={[styles.dot, animatedDot1]}>•</Animated.Text>
                <Animated.Text style={[styles.dot, animatedDot2]}>•</Animated.Text>
                <Animated.Text style={[styles.dot, animatedDot3]}>•</Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 60,
    },
    text: {
        fontSize: 18,
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturemedium,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    dot: {
        fontSize: 28,
        color: BOLD_BLUE,
        fontWeight: 'bold',
    },
});

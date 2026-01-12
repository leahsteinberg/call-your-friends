import { BOLD_BLUE, PALE_BLUE } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export default function GleamingCardLoader(): React.JSX.Element {
    const opacity1 = useSharedValue(0.3);
    const opacity2 = useSharedValue(0.3);
    const opacity3 = useSharedValue(0.3);

    useEffect(() => {
        const pulseAnimation = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            false
        );

        opacity1.value = pulseAnimation;
        opacity2.value = withDelay(300, pulseAnimation);
        opacity3.value = withDelay(600, pulseAnimation);
    }, []);

    const animatedStyle1 = useAnimatedStyle(() => ({
        opacity: opacity1.value,
    }));

    const animatedStyle2 = useAnimatedStyle(() => ({
        opacity: opacity2.value,
    }));

    const animatedStyle3 = useAnimatedStyle(() => ({
        opacity: opacity3.value,
    }));

    const CardOutline = ({ animatedStyle }: { animatedStyle: any }) => (
        <Animated.View style={[styles.cardOutline, animatedStyle]} />
    );

    return (
        <View style={styles.container}>
            <CardOutline animatedStyle={animatedStyle1} />
            <CardOutline animatedStyle={animatedStyle2} />
            <CardOutline animatedStyle={animatedStyle3} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingTop: 15,
    },
    cardOutline: {
        borderRadius: 30,
        minHeight: 140,
        borderWidth: 3,
        borderColor: BOLD_BLUE,
        backgroundColor: PALE_BLUE,
    },
});

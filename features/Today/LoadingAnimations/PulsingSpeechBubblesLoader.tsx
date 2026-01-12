import SpeechBubble1 from "@/assets/images/speech-bubble-1.svg";
import SpeechBubble2 from "@/assets/images/speech-bubble-2.svg";
import SpeechBubble3 from "@/assets/images/speech-bubble-3.svg";
import { BOLD_BLUE, BOLD_ORANGE, PALE_BLUE } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export default function PulsingSpeechBubblesLoader(): React.JSX.Element {
    // Scale animations - each bubble pulses at different rates
    const scale1 = useSharedValue(1);
    const scale2 = useSharedValue(1);
    const scale3 = useSharedValue(1);

    // Position animations - organic movement
    const translateX1 = useSharedValue(0);
    const translateY1 = useSharedValue(0);
    const translateX2 = useSharedValue(0);
    const translateY2 = useSharedValue(0);
    const translateX3 = useSharedValue(0);
    const translateY3 = useSharedValue(0);

    // Rotation animations - subtle wobble
    const rotate1 = useSharedValue(0);
    const rotate2 = useSharedValue(0);
    const rotate3 = useSharedValue(0);

    useEffect(() => {
        // Bubble 1: Scale and position
        scale1.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        translateX1.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 1500 }),
                withTiming(8, { duration: 1500 })
            ),
            -1,
            true
        );

        translateY1.value = withRepeat(
            withSequence(
                withTiming(-6, { duration: 1800 }),
                withTiming(6, { duration: 1800 })
            ),
            -1,
            true
        );

        rotate1.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 2000 }),
                withTiming(5, { duration: 2000 })
            ),
            -1,
            true
        );

        // Bubble 2: Different timings for organic feel
        scale2.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1500 + 200, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500 + 200, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        translateX2.value = withRepeat(
            withSequence(
                withTiming(10, { duration: 1700  + 200}),
                withTiming(-10, { duration: 1700  + 200})
            ),
            -1,
            true
        );

        translateY2.value = withRepeat(
            withSequence(
                withTiming(8, { duration: 2100 + 200 }),
                withTiming(-8, { duration: 2100  + 200})
            ),
            -1,
            true
        );

        rotate2.value = withRepeat(
            withSequence(
                withTiming(7, { duration: 1800  + 200}),
                withTiming(-7, { duration: 1800  + 200})
            ),
            -1,
            true
        );

        // Bubble 3: Yet different timings
        scale3.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1400 + 200, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1400 + 200, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        translateX3.value = withRepeat(
            withSequence(
                withTiming(-6, { duration: 1900 +400 }),
                withTiming(6, { duration: 1900+400 })
            ),
            -1,
            true
        );

        translateY3.value = withRepeat(
            withSequence(
                withTiming(10, { duration: 1600 +400}),
                withTiming(-10, { duration: 1600+400 })
            ),
            -1,
            true
        );

        rotate3.value = withRepeat(
            withSequence(
                withTiming(-6, { duration: 2200 + 400}),
                withTiming(6, { duration: 2200 + 400})
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle1 = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX1.value },
            { translateY: translateY1.value },
            { scale: scale1.value },
            { rotate: `${rotate1.value}deg` }
        ],
    }));

    const animatedStyle2 = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX2.value },
            { translateY: translateY2.value },
            { scale: scale2.value },
            { rotate: `${rotate2.value}deg` }
        ],
    }));

    const animatedStyle3 = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX3.value },
            { translateY: translateY3.value },
            { scale: scale3.value },
            { rotate: `${rotate3.value}deg` }
        ],
    }));

    return (
        <View style={styles.container}>
            {/* Arranged in a circular cluster */}
            <View style={styles.bubbleCluster}>
                <Animated.View style={[styles.bubble1, animatedStyle1]}>
                    <SpeechBubble1 width={100} height={100} fill={BOLD_BLUE} />
                </Animated.View>
                <Animated.View style={[styles.bubble2, animatedStyle2]}>
                    <SpeechBubble2 width={80} height={80} fill={BOLD_ORANGE} />
                </Animated.View>
                <Animated.View style={[styles.bubble3, animatedStyle3]}>
                    <SpeechBubble3 width={65} height={65} fill={PALE_BLUE} />
                </Animated.View>
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
        width: 200,
        height: 190,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bubble1: {
        position: 'absolute',
        top: 10,
        left: 20,
    },
    bubble2: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    bubble3: {
        position: 'absolute',
        bottom: 50,
        //left: 15,
        left: '65%',
        marginLeft: -24,
    },
});

import BirdSoaring from '@/assets/images/bird-soaring.svg';
import { CustomFonts } from '@/constants/theme';
import { useBroadcastEndMutation, useBroadcastNowMutation } from "@/services/meetingApi";
import { DARK_GREEN, ORANGE, PEACH } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import BroadcastDot from './BroadcastDot';
import { endBroadcast, startBroadcast } from "./broadcastSlice";

// Create an animated version of the SVG component
const AnimatedBirdSoaring = Animated.createAnimatedComponent(BirdSoaring);

// Broadcasting ripple component
const BroadcastRipple = ({ delay = 0 }: { delay?: number }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withRepeat(
                withTiming(2.5, { duration: 2000, easing: Easing.out(Easing.quad) }),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 200 }),
                    withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) })
                ),
                -1,
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.ripple, animatedStyle]} />
    );
};

export default function BroadcastNowButton(): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const isEnabled: boolean = useSelector((state: RootState) => state.broadcast.isBroadcasting);
    const [broadcastNow] = useBroadcastNowMutation();
    const [broadcastEnd] = useBroadcastEndMutation();

    // Animation value for color (0 = disabled color, 1 = enabled color)
    const colorProgress = useSharedValue(0);
    const birdScale = useSharedValue(1);
    const buttonScale = useSharedValue(1);

    // Start/stop animations based on isEnabled state
    useEffect(() => {
        if (isEnabled) {
            // Animate color to enabled state
            colorProgress.value = withTiming(1, { duration: 300 });

            // Gentle pulse for the bird
            birdScale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                false
            );

            // Subtle button pulse
            buttonScale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                false
            );
        } else {
            // Reset to disabled state
            colorProgress.value = withTiming(0, { duration: 300 });
            birdScale.value = withTiming(1, { duration: 300 });
            buttonScale.value = withTiming(1, { duration: 300 });
        }
    }, [isEnabled]);

    const animatedBirdProps = useAnimatedProps(() => ({
        color: interpolateColor(
            colorProgress.value,
            [0, 1],
            ['#999', ORANGE] // Gray when OFF, ORANGE when ON
        ),
        transform: [{ scale: birdScale.value }],
    }));

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
        backgroundColor: interpolateColor(
            colorProgress.value,
            [0, 1],
            ['#e0e0e0', PEACH] // Gray when OFF, PEACH when ON
        ),
    }));

    const handleToggle = async () => {
        const newValue = !isEnabled;
        if (newValue) {
            dispatch(startBroadcast());
            try {
                await broadcastNow({ userId });
                // RTK Query will auto-refresh via cache invalidation
            } catch (error) {
                console.error("Error broadcasting:", error);
                dispatch(endBroadcast());
            }
        } else {
            dispatch(endBroadcast());
            try {
                await broadcastEnd({ userId });
                // RTK Query will auto-refresh via cache invalidation
            } catch (error) {
                console.error("Error ending broadcast:", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <BroadcastDot/>
            <Text style={styles.label}>Share you're open for calls</Text>
            <TouchableOpacity
                onPress={handleToggle}
                activeOpacity={0.7}
                style={styles.buttonContainer}
            >
                {/* Broadcasting ripple waves (only visible when enabled) */}
                {isEnabled && (
                    <>
                        <BroadcastRipple delay={0} />
                        <BroadcastRipple delay={400} />
                        <BroadcastRipple delay={800} />
                    </>
                )}

                {/* The actual button */}
                <Animated.View style={[styles.button, animatedButtonStyle]}>
                    <AnimatedBirdSoaring
                        animatedProps={animatedBirdProps}
                    />
                    <Text style={[styles.buttonText, isEnabled && styles.buttonTextActive]}>
                        {isEnabled ? 'ON' : 'OFF'}
                    </Text>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginTop: 16,
        marginRight: 10,
        marginBottom: 4,
        borderRadius: 10,
        backgroundColor: PEACH,
    },
    label: {
        color: DARK_GREEN,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        fontFamily: CustomFonts.ztnaturebold,
    },
    buttonContainer: {
        position: 'relative',
        width: 60,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible', // Allow ripples to extend beyond
    },
    ripple: {
        position: 'absolute',
        width: 60,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: ORANGE,
        backgroundColor: 'transparent',
    },
    button: {
        width: 60,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
        fontFamily: CustomFonts.ztnaturelight,
    },
    buttonTextActive: {
        color: DARK_GREEN,
        fontWeight: '800',
    },
});

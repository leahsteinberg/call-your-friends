import { CustomFonts } from '@/constants/theme';
import { CREAM } from '@/styles/styles';
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface LiquidGlassToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
}

// Generous sizing for touchability
const TRACK_WIDTH = 120;
const TRACK_HEIGHT = 56;
const THUMB_SIZE = 48;
const THUMB_MARGIN = 4;
const TEXT_HEIGHT = 20;

export default function LiquidGlassToggle({
    value,
    onValueChange,
    disabled = false,
}: LiquidGlassToggleProps): React.JSX.Element {
    // Animation values
    const progress = useSharedValue(value ? 1 : 0);
    const thumbScale = useSharedValue(1);
    const textOffset = useSharedValue(value ? 0 : TEXT_HEIGHT);

    useEffect(() => {
        progress.value = withSpring(value ? 1 : 0, {
            damping: 15,
            stiffness: 120,
            mass: 0.8,
        });
        textOffset.value = withTiming(value ? 0 : TEXT_HEIGHT, {
            duration: 250,
            easing: Easing.out(Easing.ease),
        });
    }, [value]);

    const handleToggle = () => {
        if (!disabled) {
            onValueChange(!value);
        }
    };

    const tapGesture = Gesture.Tap()
        .onBegin(() => {
            thumbScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
        })
        .onFinalize(() => {
            thumbScale.value = withSpring(1, { damping: 12, stiffness: 150 });
            runOnJS(handleToggle)();
        });

    // Track background - brighter when on, dimmer when off
    const trackAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(120, 120, 130, 0.25)', 'rgba(255, 255, 255, 0.35)']
        );
        const borderColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.5)']
        );
        return {
            backgroundColor,
            borderColor,
        };
    });

    // Inner glow layer for liquid glass depth
    const innerGlowStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0, 1], [0.3, 0.7]);
        return { opacity };
    });

    // Thumb position and scale
    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            progress.value,
            [0, 1],
            [THUMB_MARGIN, TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN]
        );
        return {
            transform: [
                { translateX },
                { scale: thumbScale.value },
            ],
        };
    });

    // Thumb glow - brighter when on
    const thumbGlowStyle = useAnimatedStyle(() => {
        const shadowOpacity = interpolate(progress.value, [0, 1], [0.1, 0.4]);
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.98)']
        );
        return {
            backgroundColor,
            shadowOpacity,
        };
    });

    // Text container mask animation
    const onTextStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            progress.value,
            [0, 1],
            [TEXT_HEIGHT, 0]
        );
        const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0.5, 1]);
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    const offTextStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            progress.value,
            [0, 1],
            [0, -TEXT_HEIGHT]
        );
        const opacity = interpolate(progress.value, [0, 0.5, 1], [1, 0.5, 0]);
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    // Overall container opacity for disabled state
    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: disabled ? 0.5 : 1,
        };
    });

    // Blur intensity changes with state
    const blurIntensity = value ? 20 : 40;

    return (
        <GestureDetector gesture={tapGesture}>
            <Animated.View style={[styles.container, containerStyle]}>
                {/* Outer shadow for neumorphic depth */}
                <View style={styles.outerShadow} />

                {/* Main track with blur */}
                <Animated.View style={[styles.track, trackAnimatedStyle]}>
                    {Platform.OS !== 'web' && (
                        <BlurView
                            intensity={blurIntensity}
                            tint="light"
                            style={StyleSheet.absoluteFill}
                        />
                    )}

                    {/* Inner highlight for glass depth */}
                    <Animated.View style={[styles.innerGlow, innerGlowStyle]} />

                    {/* Text labels with slide animation */}
                    <View style={styles.textContainer}>
                        <View style={styles.textMask}>
                            <Animated.Text style={[styles.labelText, styles.onText, onTextStyle]}>
                                On
                            </Animated.Text>
                            <Animated.Text style={[styles.labelText, styles.offText, offTextStyle]}>
                                Off
                            </Animated.Text>
                        </View>
                    </View>

                    {/* Thumb */}
                    <Animated.View style={[styles.thumbOuter, thumbAnimatedStyle]}>
                        <Animated.View style={[styles.thumb, thumbGlowStyle]}>
                            {/* Inner thumb highlight */}
                            <View style={styles.thumbHighlight} />
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    outerShadow: {
        position: 'absolute',
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    track: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        borderWidth: 1.5,
        overflow: 'hidden',
        justifyContent: 'center',
        // Neumorphic inner shadow effect
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
        }),
    },
    innerGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: TRACK_HEIGHT / 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        // Top inner highlight
        borderTopColor: 'rgba(255, 255, 255, 0.6)',
        borderBottomColor: 'transparent',
    },
    textContainer: {
        position: 'absolute',
        left: THUMB_SIZE + THUMB_MARGIN + 8,
        right: THUMB_SIZE + THUMB_MARGIN + 8,
        height: TEXT_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textMask: {
        height: TEXT_HEIGHT,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelText: {
        position: 'absolute',
        fontSize: 14,
        fontFamily: CustomFonts.ztnaturebold,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    onText: {
        color: CREAM,
    },
    offText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    thumbOuter: {
        position: 'absolute',
        top: THUMB_MARGIN,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        // Neumorphic shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    thumbHighlight: {
        position: 'absolute',
        top: 2,
        left: 4,
        right: 4,
        height: THUMB_SIZE / 2 - 4,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        // Subtle gradient effect via border
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.9)',
    },
});

import { CustomFonts } from '@/constants/theme';
import { useIsBroadcasting } from '@/hooks/useIsBroadcasting';
import { CREAM } from '@/styles/styles';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedProps,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type BroadcastState = 'off' | 'customizing' | 'broadcasting';

interface BroadcastToggleProps {
    onCustomizeBroadcast: () => void;
    onStartBroadcast: () => void;
    onEndBroadcast: () => void;
}

// Generous liquid glass sizing
const TRACK_WIDTH = 90;
const TRACK_HEIGHT = 52;
const THUMB_SIZE = 44;
const THUMB_MARGIN = 4;
const COUNTDOWN_SECONDS = 10;

// Progress ring sizing
const RING_SIZE = THUMB_SIZE - 8;
const RING_STROKE_WIDTH = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Slower spring config
const SLOW_SPRING = {
    damping: 20,
    stiffness: 80,
    mass: 1,
};

export default function BroadcastToggle({
    onCustomizeBroadcast,
    onStartBroadcast,
    onEndBroadcast,
}: BroadcastToggleProps): React.JSX.Element {
    const isBroadcasting = useIsBroadcasting();
    const [localState, setLocalState] = useState<BroadcastState>(isBroadcasting ? 'broadcasting' : 'off');
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Animation values
    const progress = useSharedValue(isBroadcasting ? 1 : 0);
    const thumbScale = useSharedValue(1);
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0);
    const countdownProgress = useSharedValue(0); // 0 to 1 for the ring

    // For text animation - only animate when fully broadcasting
    const isFullyOn = useSharedValue(isBroadcasting ? 1 : 0);

    // Sync with external broadcasting state
    useEffect(() => {
        if (isBroadcasting && localState !== 'broadcasting') {
            setLocalState('broadcasting');
            progress.value = withSpring(1, SLOW_SPRING);
            isFullyOn.value = withTiming(1, { duration: 400 });
        } else if (!isBroadcasting && localState === 'broadcasting') {
            setLocalState('off');
            progress.value = withSpring(0, SLOW_SPRING);
            isFullyOn.value = withTiming(0, { duration: 400 });
        }
    }, [isBroadcasting]);

    // Handle countdown timer with progress ring
    useEffect(() => {
        if (localState === 'customizing') {
            // Reset and animate the progress ring over COUNTDOWN_SECONDS
            countdownProgress.value = 0;
            countdownProgress.value = withTiming(1, {
                duration: COUNTDOWN_SECONDS * 1000,
                easing: Easing.linear,
            });

            // Set a timeout to transition to broadcasting
            countdownRef.current = setTimeout(() => {
                setLocalState('broadcasting');
                isFullyOn.value = withTiming(1, { duration: 400 });
                onStartBroadcast();
            }, COUNTDOWN_SECONDS * 1000);
        } else {
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
                countdownRef.current = null;
            }
            // Reset progress ring
            countdownProgress.value = withTiming(0, { duration: 200 });
        }

        return () => {
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
            }
        };
    }, [localState, onStartBroadcast]);

    // Pulse animation for broadcasting state
    useEffect(() => {
        if (localState === 'broadcasting') {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.12, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.4, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            pulseScale.value = withTiming(1, { duration: 300 });
            pulseOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [localState]);

    const handleToggle = useCallback(() => {
        if (localState === 'off') {
            setLocalState('customizing');
            progress.value = withSpring(1, SLOW_SPRING);
            onCustomizeBroadcast();
        } else if (localState === 'customizing' || localState === 'broadcasting') {
            if (localState === 'broadcasting') {
                onEndBroadcast();
            }
            setLocalState('off');
            progress.value = withSpring(0, SLOW_SPRING);
            isFullyOn.value = withTiming(0, { duration: 400 });
        }
    }, [localState, onCustomizeBroadcast, onEndBroadcast]);

    const tapGesture = Gesture.Tap()
        .onBegin(() => {
            thumbScale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
        })
        .onFinalize(() => {
            thumbScale.value = withSpring(1, { damping: 12, stiffness: 150 });
            runOnJS(handleToggle)();
        });

    // Track - brighter when on, dimmer when off
    const trackAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(80, 80, 100, 0.15)', 'rgba(255, 255, 255, 0.3)']
        );
        const borderColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.45)']
        );
        return {
            backgroundColor,
            borderColor,
        };
    });

    // Inner glow intensity
    const innerGlowStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0, 1], [0.15, 0.5]);
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

    // Thumb - darker/more transparent when off, bright when on
    const thumbGlowStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(180, 180, 190, 0.5)', 'rgba(255, 255, 255, 0.98)']
        );
        const shadowOpacity = interpolate(progress.value, [0, 1], [0.08, 0.3]);
        return {
            backgroundColor,
            shadowOpacity,
        };
    });

    // Thumb highlight - faded when off
    const thumbHighlightStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0, 1], [0.3, 0.7]);
        return { opacity };
    });

    // Pulse ring for broadcasting
    const pulseRingStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }],
            opacity: pulseOpacity.value,
        };
    });

    // Progress ring stroke animation
    const strokeDashoffset = useDerivedValue(() => {
        return RING_CIRCUMFERENCE * (1 - countdownProgress.value);
    });

    const progressRingProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: strokeDashoffset.value,
        };
    });

    // Text animation - only when fully on (after countdown)
    const modeOnStyle = useAnimatedStyle(() => {
        const translateY = interpolate(isFullyOn.value, [0, 1], [16, 0]);
        const opacity = interpolate(isFullyOn.value, [0, 0.5, 1], [0, 0.3, 1]);
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    const modeOffStyle = useAnimatedStyle(() => {
        const translateY = interpolate(isFullyOn.value, [0, 1], [0, -16]);
        const opacity = interpolate(isFullyOn.value, [0, 0.5, 1], [1, 0.3, 0]);
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    // Dynamic blur intensity - more blur when off
    const blurIntensity = localState === 'off' ? 50 : localState === 'customizing' ? 25 : 12;

    // Show progress ring only during customizing state
    const showProgressRing = localState === 'customizing';

    return (
        <View style={styles.container}>
            {/* Side label - always visible */}
            <View style={styles.sideLabelContainer}>
                <Text style={styles.callMeText}>CALL ME</Text>
                <View style={styles.modeTextMask}>
                    <Animated.Text style={[styles.modeText, modeOnStyle]}>
                        MODE ON
                    </Animated.Text>
                    <Animated.Text style={[styles.modeText, styles.modeOffText, modeOffStyle]}>
                        MODE OFF
                    </Animated.Text>
                </View>
            </View>

            <GestureDetector gesture={tapGesture}>
                <View style={styles.toggleWrapper}>
                    {/* Outer shadow for neumorphic depth */}
                    <View style={styles.outerShadow} />

                    {/* Pulse ring for broadcasting state */}
                    {localState === 'broadcasting' && (
                        <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
                    )}

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

                        {/* Thumb */}
                        <Animated.View style={[styles.thumbOuter, thumbAnimatedStyle]}>
                            <Animated.View style={[styles.thumb, thumbGlowStyle]}>
                                {/* Inner thumb highlight */}
                                <Animated.View style={[styles.thumbHighlight, thumbHighlightStyle]} />

                                {/* Progress ring - transparent showing background */}
                                {showProgressRing && (
                                    <View style={styles.progressRingContainer}>
                                        <Svg width={RING_SIZE} height={RING_SIZE}>
                                            {/* Background circle - very subtle */}
                                            <Circle
                                                cx={RING_SIZE / 2}
                                                cy={RING_SIZE / 2}
                                                r={RING_RADIUS}
                                                stroke="rgba(0, 0, 0, 0.1)"
                                                strokeWidth={RING_STROKE_WIDTH}
                                                fill="transparent"
                                            />
                                            {/* Animated progress circle */}
                                            <AnimatedCircle
                                                cx={RING_SIZE / 2}
                                                cy={RING_SIZE / 2}
                                                r={RING_RADIUS}
                                                stroke="rgba(0, 0, 0, 0.4)"
                                                strokeWidth={RING_STROKE_WIDTH}
                                                fill="transparent"
                                                strokeDasharray={RING_CIRCUMFERENCE}
                                                animatedProps={progressRingProps}
                                                strokeLinecap="round"
                                                rotation="-90"
                                                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                                            />
                                        </Svg>
                                    </View>
                                )}
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sideLabelContainer: {
        marginRight: 12,
        alignItems: 'flex-end',
    },
    callMeText: {
        fontSize: 14,
        fontFamily: CustomFonts.ztnaturebold,
        fontWeight: '700',
        color: CREAM,
        letterSpacing: 1,
    },
    modeTextMask: {
        height: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    modeText: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        fontSize: 11,
        fontFamily: CustomFonts.ztnaturemedium,
        fontWeight: '500',
        color: CREAM,
        letterSpacing: 0.5,
        textAlign: 'right',
    },
    modeOffText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    toggleWrapper: {
        padding: 8,
        position: 'relative',
    },
    outerShadow: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.18,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    pulseRing: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    track: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        borderWidth: 1.5,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    innerGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: TRACK_HEIGHT / 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderTopColor: 'rgba(255, 255, 255, 0.4)',
        borderBottomColor: 'transparent',
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    thumbHighlight: {
        position: 'absolute',
        top: 3,
        left: 5,
        right: 5,
        height: THUMB_SIZE / 2 - 5,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.8)',
    },
    progressRingContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

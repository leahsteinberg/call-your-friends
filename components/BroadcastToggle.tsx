import { CustomFonts } from '@/constants/theme';
import { useIsBroadcasting } from '@/hooks/useIsBroadcasting';
import { CREAM } from '@/styles/styles';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

type BroadcastState = 'off' | 'customizing' | 'broadcasting';

interface BroadcastToggleProps {
    onCustomizeBroadcast: () => void;
    onStartBroadcast: () => void;
    onEndBroadcast: () => void;
}

// Generous liquid glass sizing
const TRACK_WIDTH = 130;
const TRACK_HEIGHT = 60;
const THUMB_SIZE = 52;
const THUMB_MARGIN = 4;
const TEXT_HEIGHT = 22;
const COUNTDOWN_SECONDS = 10;

export default function BroadcastToggle({
    onCustomizeBroadcast,
    onStartBroadcast,
    onEndBroadcast,
}: BroadcastToggleProps): React.JSX.Element {
    const isBroadcasting = useIsBroadcasting();
    const [localState, setLocalState] = useState<BroadcastState>(isBroadcasting ? 'broadcasting' : 'off');
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Animation values
    const progress = useSharedValue(isBroadcasting ? 1 : 0);
    const thumbScale = useSharedValue(1);
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0);

    // Sync with external broadcasting state
    useEffect(() => {
        if (isBroadcasting && localState !== 'broadcasting') {
            setLocalState('broadcasting');
            progress.value = withSpring(1, { damping: 15, stiffness: 120 });
        } else if (!isBroadcasting && localState === 'broadcasting') {
            setLocalState('off');
            progress.value = withSpring(0, { damping: 15, stiffness: 120 });
        }
    }, [isBroadcasting]);

    // Handle countdown timer
    useEffect(() => {
        if (localState === 'customizing') {
            setCountdown(COUNTDOWN_SECONDS);
            countdownRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        }

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [localState]);

    // Trigger broadcast start when countdown reaches 0
    useEffect(() => {
        if (countdown === 0 && localState === 'customizing') {
            setLocalState('broadcasting');
            onStartBroadcast();
        }
    }, [countdown, localState, onStartBroadcast]);

    // Pulse animation for broadcasting state
    useEffect(() => {
        if (localState === 'broadcasting') {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
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
            progress.value = withSpring(1, { damping: 15, stiffness: 120, mass: 0.8 });
            onCustomizeBroadcast();
        } else if (localState === 'customizing' || localState === 'broadcasting') {
            if (localState === 'broadcasting') {
                onEndBroadcast();
            }
            setLocalState('off');
            progress.value = withSpring(0, { damping: 15, stiffness: 120, mass: 0.8 });
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
            ['rgba(100, 100, 120, 0.2)', 'rgba(255, 255, 255, 0.35)']
        );
        const borderColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.5)']
        );
        return {
            backgroundColor,
            borderColor,
        };
    });

    // Inner glow intensity
    const innerGlowStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0, 1], [0.2, 0.6]);
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
        const shadowOpacity = interpolate(progress.value, [0, 1], [0.15, 0.35]);
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.98)']
        );
        return {
            backgroundColor,
            shadowOpacity,
        };
    });

    // Pulse ring for broadcasting
    const pulseRingStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }],
            opacity: pulseOpacity.value,
        };
    });

    // Text animations - slide up/down
    const onTextStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [TEXT_HEIGHT, 0]);
        const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0.3, 1]);
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    const offTextStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [0, -TEXT_HEIGHT]);
        const opacity = interpolate(progress.value, [0, 0.5, 1], [1, 0.3, 0]);
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    // Dynamic blur intensity - more blur when off
    const blurIntensity = localState === 'off' ? 50 : localState === 'customizing' ? 30 : 15;

    // Status text below toggle
    const getStatusText = () => {
        switch (localState) {
            case 'off':
                return '';
            case 'customizing':
                return `Starting in ${countdown}s`;
            case 'broadcasting':
                return '';
        }
    };

    return (
        <View style={styles.container}>
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
                </View>
            </GestureDetector>

            {/* Status text */}
            {getStatusText() !== '' && (
                <Animated.Text style={styles.statusText}>{getStatusText()}</Animated.Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    toggleWrapper: {
        padding: 10,
        position: 'relative',
    },
    outerShadow: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    pulseRing: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
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
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderTopColor: 'rgba(255, 255, 255, 0.5)',
        borderBottomColor: 'transparent',
    },
    textContainer: {
        position: 'absolute',
        left: THUMB_SIZE + THUMB_MARGIN + 6,
        right: THUMB_SIZE + THUMB_MARGIN + 6,
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
        fontSize: 15,
        fontFamily: CustomFonts.ztnaturebold,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    onText: {
        color: CREAM,
    },
    offText: {
        color: 'rgba(255, 255, 255, 0.5)',
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
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    thumbHighlight: {
        position: 'absolute',
        top: 3,
        left: 6,
        right: 6,
        height: THUMB_SIZE / 2 - 6,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.9)',
    },
    statusText: {
        marginTop: 6,
        fontSize: 12,
        fontFamily: CustomFonts.ztnaturemedium,
        color: CREAM,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});

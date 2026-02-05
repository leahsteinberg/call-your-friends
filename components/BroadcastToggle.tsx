import { CustomFonts } from '@/constants/theme';
import { useIsBroadcasting } from '@/hooks/useIsBroadcasting';
import { CORNFLOWER_BLUE, CREAM, PALE_BLUE } from '@/styles/styles';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
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

const TOGGLE_WIDTH = 56;
const TOGGLE_HEIGHT = 28;
const THUMB_SIZE = 22;
const THUMB_MARGIN = 3;
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
    const togglePosition = useSharedValue(0);
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0);

    // Sync with external broadcasting state
    useEffect(() => {
        if (isBroadcasting && localState !== 'broadcasting') {
            setLocalState('broadcasting');
            togglePosition.value = withSpring(1);
        } else if (!isBroadcasting && localState === 'broadcasting') {
            setLocalState('off');
            togglePosition.value = withSpring(0);
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
    useAnimatedReaction(
        () => localState,
        (state) => {
            if (state === 'broadcasting') {
                pulseScale.value = withRepeat(
                    withSequence(
                        withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                    ),
                    -1,
                    false
                );
                pulseOpacity.value = withRepeat(
                    withSequence(
                        withDelay(0, withTiming(0.6, { duration: 1000 })),
                        withTiming(0, { duration: 1000 })
                    ),
                    -1,
                    false
                );
            } else {
                pulseScale.value = withTiming(1, { duration: 300 });
                pulseOpacity.value = withTiming(0, { duration: 300 });
            }
        },
        [localState]
    );

    const handleToggle = useCallback(() => {
        if (localState === 'off') {
            setLocalState('customizing');
            togglePosition.value = withSpring(1);
            onCustomizeBroadcast();
        } else if (localState === 'customizing' || localState === 'broadcasting') {
            if (localState === 'broadcasting') {
                onEndBroadcast();
            }
            setLocalState('off');
            togglePosition.value = withSpring(0);
        }
    }, [localState, onCustomizeBroadcast, onEndBroadcast]);

    const tapGesture = Gesture.Tap().onEnd(() => {
        runOnJS(handleToggle)();
    });

    const trackAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            togglePosition.value,
            [0, 1],
            [PALE_BLUE, CORNFLOWER_BLUE]
        );
        return { backgroundColor };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            togglePosition.value,
            [0, 1],
            [THUMB_MARGIN, TOGGLE_WIDTH - THUMB_SIZE - THUMB_MARGIN]
        );
        return {
            transform: [{ translateX }],
        };
    });

    const pulseAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }],
            opacity: pulseOpacity.value,
        };
    });

    const getStatusText = () => {
        switch (localState) {
            case 'off':
                return 'Call Me Mode Off';
            case 'customizing':
                return `Starting in ${countdown}s`;
            case 'broadcasting':
                return 'Call Me Mode On';
        }
    };

    return (
        <View style={styles.container}>
            <GestureDetector gesture={tapGesture}>
                <View style={styles.toggleContainer}>
                    <Animated.View style={[styles.track, trackAnimatedStyle]}>
                        {/* Pulse ring for broadcasting state */}
                        {localState === 'broadcasting' && (
                            <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />
                        )}
                        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
                    </Animated.View>
                </View>
            </GestureDetector>
            <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    toggleContainer: {
        padding: 4,
    },
    track: {
        width: TOGGLE_WIDTH,
        height: TOGGLE_HEIGHT,
        borderRadius: TOGGLE_HEIGHT / 2,
        justifyContent: 'center',
        overflow: 'visible',
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: CREAM,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    pulseRing: {
        position: 'absolute',
        width: TOGGLE_WIDTH,
        height: TOGGLE_HEIGHT,
        borderRadius: TOGGLE_HEIGHT / 2,
        backgroundColor: CORNFLOWER_BLUE,
    },
    statusText: {
        marginTop: 4,
        fontSize: 10,
        fontFamily: CustomFonts.ztnatureregular,
        color: CREAM,
        textAlign: 'center',
    },
});

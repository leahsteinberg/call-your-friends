import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import { Image } from "expo-image";
import React, { createContext, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

// ============================================
// CONTEXT
// ============================================
interface AvatarContextType {
    size: number;
}

const AvatarContext = createContext<AvatarContextType>({ size: 48 });

function useAvatarContext() {
    return useContext(AvatarContext);
}

// ============================================
// BASE AVATAR
// ============================================
interface AvatarProps {
    name?: string;
    avatarUrl?: string;
    size?: number;
    children?: React.ReactNode;
}

function AvatarComponent({ name, avatarUrl, size = 48, children }: AvatarProps): React.JSX.Element {
    const initial = name?.charAt(0).toUpperCase() ?? '?';

    return (
        <AvatarContext.Provider value={{ size }}>
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <View
                    style={[
                        styles.circle,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        },
                    ]}
                >
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={{ width: size, height: size, borderRadius: size / 2 }}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
                    )}
                </View>
                {children}
            </View>
        </AvatarContext.Provider>
    );
}

// ============================================
// TIMER RING
// ============================================
interface TimerRingProps {
    scheduledEnd?: string;
    color?: string;
    strokeWidth?: number;
    trackColor?: string;
    padding?: number;
}

function getTimeFraction(scheduledEnd: string): number {
    const diffMs = new Date(scheduledEnd).getTime() - Date.now();
    if (diffMs <= 0) return 0;
    const diffMin = diffMs / (1000 * 60);
    return Math.min(diffMin / 60, 1);
}

function TimerRing({
    scheduledEnd,
    color = CORNFLOWER_BLUE,
    strokeWidth = 3,
    trackColor = "rgba(0, 0, 0, 0.08)",
    padding = 4,
}: TimerRingProps): React.JSX.Element | null {
    const { size } = useAvatarContext();
    const ringSize = size + padding * 2;
    const ringRadius = (ringSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * ringRadius;

    const [fraction, setFraction] = useState(() =>
        scheduledEnd ? getTimeFraction(scheduledEnd) : 1
    );

    useEffect(() => {
        if (!scheduledEnd) return;
        setFraction(getTimeFraction(scheduledEnd));
        const interval = setInterval(() => {
            setFraction(getTimeFraction(scheduledEnd));
        }, 10_000);
        return () => clearInterval(interval);
    }, [scheduledEnd]);

    const strokeDashoffset = circumference * (1 - fraction);

    return (
        <Svg
            width={ringSize}
            height={ringSize}
            style={{ position: 'absolute' }}
        >
            {/* Background track */}
            <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke={trackColor}
                strokeWidth={strokeWidth}
                fill="transparent"
            />
            {/* Countdown arc */}
            <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation={-90}
                origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
        </Svg>
    );
}

// ============================================
// PULSE RING
// ============================================
interface PulseRingProps {
    active: boolean;
    color?: string;
    borderColor?: string;
}

function PulseRing({
    active,
    color = "red",
    borderColor = "orange",
}: PulseRingProps): React.JSX.Element | null {
    const { size } = useAvatarContext();
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0);

    useEffect(() => {
        if (active) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.35, { duration: 1600, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: 50 }),
                    withTiming(1, { duration: 400 }),
                ),
                -1, false
            );
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 50 }),
                    withTiming(0, { duration: 1550, easing: Easing.in(Easing.ease) }),
                    withTiming(0, { duration: 50 }),
                    withTiming(0, { duration: 400 }),
                ),
                -1, false
            );
        } else {
            pulseScale.value = withTiming(1, { duration: 300 });
            pulseOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [active]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    borderWidth: 1.5,
                    borderColor: borderColor,
                },
                animatedStyle,
            ]}
        />
    );
}

// ============================================
// GREYSCALE
// ============================================
interface GreyscaleProps {
    intensity?: number;
}

function Greyscale({ intensity = 1 }: GreyscaleProps): React.JSX.Element | null {
    const { size } = useAvatarContext();
    if (intensity <= 0) return null;

    return (
        <View
            style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: 'grey',
                opacity: intensity * 0.5,
            }}
            pointerEvents="none"
        />
    );
}

// ============================================
// MINI AVATAR
// ============================================
interface MiniAvatarProps {
    name?: string;
    avatarUrl?: string;
}

function MiniAvatar({ name, avatarUrl }: MiniAvatarProps): React.JSX.Element {
    const { size } = useAvatarContext();
    const miniSize = Math.round(size * 0.45);
    const initial = name?.charAt(0).toUpperCase() ?? '?';

    return (
        <View
            style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: miniSize,
                height: miniSize,
                borderRadius: miniSize / 2,
                backgroundColor: CREAM,
                borderWidth: 1.5,
                borderColor: CORNFLOWER_BLUE,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
            }}
        >
            {avatarUrl ? (
                <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: miniSize, height: miniSize, borderRadius: miniSize / 2 }}
                    contentFit="cover"
                    transition={200}
                />
            ) : (
                <Text style={{ fontSize: miniSize * 0.42, fontWeight: '600', color: BOLD_BLUE, fontFamily: CustomFonts.ztnaturebold }}>
                    {initial}
                </Text>
            )}
        </View>
    );
}

// ============================================
// COMPOSE & EXPORT
// ============================================
const Avatar = Object.assign(AvatarComponent, {
    TimerRing,
    PulseRing,
    Greyscale,
    MiniAvatar,
});

export default Avatar;

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    circle: {
        backgroundColor: CREAM,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: CORNFLOWER_BLUE,
        overflow: 'hidden',
    },
    initial: {
        fontWeight: '600',
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
    },
});

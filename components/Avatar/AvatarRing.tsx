import { CORNFLOWER_BLUE } from '@/styles/styles';
import React, { useEffect, useState } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAvatarContext } from './Avatar';

export const DEFAULT_GRADIENT_COLORS = [CORNFLOWER_BLUE, '#A855F7', '#EC4899'];

// ============================================
// TIMER RING
// ============================================
interface TimerRingProps {
    scheduledEnd?: string;
    color?: string;
    strokeWidth?: number;
    trackColor?: string;
    padding?: number;
    gradient?: boolean;
    gradientColors?: string[];
    gradientSpeed?: number;
}

function getTimeFraction(scheduledEnd: string): number {
    const diffMs = new Date(scheduledEnd).getTime() - Date.now();
    if (diffMs <= 0) return 0;
    const diffMin = diffMs / (1000 * 60);
    return Math.min(diffMin / 60, 1);
}

export function TimerRing({
    scheduledEnd,
    color = CORNFLOWER_BLUE,
    strokeWidth = 3,
    trackColor = "rgba(0, 0, 0, 0.08)",
    padding = 4,
    gradient = false,
    gradientColors = DEFAULT_GRADIENT_COLORS,
    gradientSpeed = 3000,
}: TimerRingProps): React.JSX.Element | null {
    const { size } = useAvatarContext();
    const rotation = useSharedValue(0);
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

    useEffect(() => {
        if (!gradient) return;
        rotation.value = withRepeat(
            withTiming(360, { duration: gradientSpeed, easing: Easing.linear }),
            -1,
            false
        );
    }, [gradient, gradientSpeed]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const strokeDashoffset = circumference * (1 - fraction);
    const stops = gradient
        ? gradientColors.map((c, i) => ({ offset: i / (gradientColors.length - 1), color: c }))
        : [];

    const svgContent = (
        <Svg width={ringSize} height={ringSize}>
            {gradient && (
                <Defs>
                    <LinearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1">
                        {stops.map((s, i) => (
                            <Stop key={i} offset={`${s.offset}`} stopColor={s.color} />
                        ))}
                    </LinearGradient>
                </Defs>
            )}
            <Circle
                cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                stroke={trackColor} strokeWidth={strokeWidth} fill="transparent"
            />
            <Circle
                cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                stroke={gradient ? "url(#timerGradient)" : color}
                strokeWidth={strokeWidth} fill="transparent"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" rotation={-90}
                origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
        </Svg>
    );

    if (gradient) {
        return (
            <Animated.View style={[{ position: 'absolute', width: ringSize, height: ringSize }, animatedStyle]}>
                {svgContent}
            </Animated.View>
        );
    }
    return (
        <Animated.View style={{ position: 'absolute', width: ringSize, height: ringSize }}>
            {svgContent}
        </Animated.View>
    );
}

// ============================================
// GRADIENT RING
// ============================================
interface GradientRingProps {
    colors?: string[];
    strokeWidth?: number;
    padding?: number;
    speed?: number;
}

export function GradientRing({
    colors = DEFAULT_GRADIENT_COLORS,
    strokeWidth = 3,
    padding = 4,
    speed = 3000,
}: GradientRingProps): React.JSX.Element {
    const { size } = useAvatarContext();
    const rotation = useSharedValue(0);
    const ringSize = size + padding * 2;
    const ringRadius = (ringSize - strokeWidth) / 2;

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: speed, easing: Easing.linear }),
            -1,
            false
        );
    }, [speed]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const stops = colors.map((color, i) => ({
        offset: i / (colors.length - 1),
        color,
    }));

    return (
        <Animated.View style={[{ position: 'absolute', width: ringSize, height: ringSize }, animatedStyle]}>
            <Svg width={ringSize} height={ringSize}>
                <Defs>
                    <LinearGradient id="gradientRing" x1="0" y1="0" x2="1" y2="1">
                        {stops.map((s, i) => (
                            <Stop key={i} offset={`${s.offset}`} stopColor={s.color} />
                        ))}
                    </LinearGradient>
                </Defs>
                <Circle
                    cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                    stroke="url(#gradientRing)" strokeWidth={strokeWidth} fill="transparent"
                />
            </Svg>
        </Animated.View>
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

export function PulseRing({
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

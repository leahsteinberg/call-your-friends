import { VIBE_WORDS } from "@/components/CardActionDecorations/VibeButton";
import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, BURGUNDY, CORNFLOWER_BLUE, CREAM, FUN_PURPLE, PALE_BLUE } from "@/styles/styles";
import { Image } from "expo-image";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

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
    borderColor?: string;
    borderWidth?: number;
}

function AvatarComponent({ name, avatarUrl, size = 48, children, borderColor, borderWidth }: AvatarProps): React.JSX.Element {
    const initial = name?.charAt(0).toUpperCase() ?? '?';
    const hasBorder = borderColor !== undefined && borderWidth !== undefined && borderWidth > 0;

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
                            ...(hasBorder && { borderWidth, borderColor }),
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

function TimerRing({
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
                stroke={gradient ? "url(#timerGradient)" : color}
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

    if (gradient) {
        return (
            <Animated.View
                style={[{ position: 'absolute', width: ringSize, height: ringSize }, animatedStyle]}
            >
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
const DEFAULT_GRADIENT_COLORS = [CORNFLOWER_BLUE, '#A855F7', '#EC4899'];

interface GradientRingProps {
    colors?: string[];
    strokeWidth?: number;
    padding?: number;
    speed?: number; // rotation duration in ms
}

function GradientRing({
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

    // Distribute stops evenly
    const stops = colors.map((color, i) => ({
        offset: i / (colors.length - 1),
        color,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: ringSize,
                    height: ringSize,
                },
                animatedStyle,
            ]}
        >
            <Svg width={ringSize} height={ringSize}>
                <Defs>
                    <LinearGradient id="gradientRing" x1="0" y1="0" x2="1" y2="1">
                        {stops.map((s, i) => (
                            <Stop key={i} offset={`${s.offset}`} stopColor={s.color} />
                        ))}
                    </LinearGradient>
                </Defs>
                <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    stroke="url(#gradientRing)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
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
    const miniSize = Math.round(size * 0.5);
    const initial = name?.charAt(0).toUpperCase() ?? '?';

    return (
        <View
            style={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                width: miniSize,
                height: miniSize,
                borderRadius: miniSize / 2,
                backgroundColor: CREAM,
                borderWidth: 1.5,
                borderColor: CREAM,
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
// SPEECH BUBBLE (Vibe Status)
// ============================================
interface SpeechBubbleProps {
    selectedVibe?: string | null;
    onVibeSelect?: (vibeId: string | null) => void;
    displayOnly?: boolean;
}

function SpeechBubble({
    selectedVibe = null,
    onVibeSelect,
    displayOnly = false,
}: SpeechBubbleProps): React.JSX.Element | null {
    const { size } = useAvatarContext();
    const [showModal, setShowModal] = useState(false);

    const vibeWord = selectedVibe ? VIBE_WORDS.find(w => w.id === selectedVibe) : null;
    const hasVibe = !!vibeWord;

    // In display-only mode with no vibe, don't render
    if (displayOnly && !hasVibe) return null;

    const handlePress = () => {
        if (!displayOnly) {
            setShowModal(true);
        }
    };

    const handleVibeSelect = (vibeId: string | null) => {
        onVibeSelect?.(vibeId);
        setShowModal(false);
    };

    const tailSize = 6;

    return (
        <>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={displayOnly ? 1 : 0.7}
                disabled={displayOnly}
                style={{
                    position: 'absolute',
                    top: -size * (hasVibe ? 0.08 : .12),
                    left: -size * (hasVibe ? 0.2 : 0.1),
                    transform: [{rotate: '-15deg'}],
                    zIndex: 10,
                }}
            >
                {/* Bubble body */}
                <View style={{
                    backgroundColor: hasVibe ? CREAM: FUN_PURPLE,
                    borderRadius: 10,
                    paddingHorizontal: hasVibe ? 6 : 5,
                    paddingVertical: hasVibe ? 3 : 4,
                    minWidth: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 2,
                    elevation: 3,
                }}>
                    {hasVibe ? (
                        <Text style={{
                            fontSize: 10,
                            fontFamily: CustomFonts.ztnaturebold,
                            color: BURGUNDY,
                            fontWeight: '700',
                        }}>
                            {vibeWord.label}
                        </Text>
                    ) : (
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: CREAM,
                        }}>
                            {` + `}
                        </Text>
                    )}
                </View>
                {/* Speech bubble tail */}
                <View style={{
                    position: 'absolute',
                    bottom: -tailSize + 1,
                    right: 4,
                    left: hasVibe ? 15 : 10,
                    width: 0,
                    height: -15,
                    borderLeftWidth: tailSize,
                    borderRightWidth: 0,
                    borderTopWidth: tailSize,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: hasVibe ? CREAM : FUN_PURPLE,
                }} />
            </TouchableOpacity>

            {/* Vibe selection modal */}
            {!displayOnly && (
                <Modal
                    visible={showModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowModal(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                        <View style={speechBubbleStyles.modalOverlay}>
                            <View style={speechBubbleStyles.modalContainer}>
                                {VIBE_WORDS.map((word) => (
                                    <TouchableOpacity
                                        key={word.id}
                                        style={speechBubbleStyles.vibeOption}
                                        onPress={() => handleVibeSelect(word.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={speechBubbleStyles.vibeOptionText}>{word.text}</Text>
                                    </TouchableOpacity>
                                ))}
                                <View style={speechBubbleStyles.separator} />
                                <TouchableOpacity
                                    style={speechBubbleStyles.noneButton}
                                    onPress={() => handleVibeSelect(null)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={speechBubbleStyles.noneButtonText}>None</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </>
    );
}

const speechBubbleStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: CREAM,
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        gap: 8,
    },
    vibeOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: PALE_BLUE,
    },
    vibeOptionText: {
        color: BURGUNDY,
        fontSize: 13,
        fontWeight: '600',
    },
    separator: {
        width: 40,
        height: 1,
        backgroundColor: BURGUNDY,
        opacity: 0.15,
    },
    noneButton: {
        width: 60,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noneButtonText: {
        color: BURGUNDY,
        fontSize: 14,
        fontWeight: '600',
    },
});

// ============================================
// COMPOSE & EXPORT
// ============================================
const Avatar = Object.assign(AvatarComponent, {
    TimerRing,
    GradientRing,
    PulseRing,
    Greyscale,
    MiniAvatar,
    SpeechBubble,
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
        // borderWidth: 2,
        // borderColor: 'red',
        overflow: 'hidden',
    },
    initial: {
        fontWeight: '600',
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
    },
});

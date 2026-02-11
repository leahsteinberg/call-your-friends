import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { VIBE_WORDS } from "../CardActionDecorations/VibeButton";

const TILE_WIDTH = 140;
const AVATAR_SIZE = 48;
const RING_PADDING = 4;
const RING_SIZE = AVATAR_SIZE + RING_PADDING * 2;
const RING_STROKE_WIDTH = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface BroadcastTileUser {
    name?: string;
    avatarUrl?: string;
    id?: string;
}

interface BroadcastTileProps {
    user?: BroadcastTileUser;
    vibe?: string;
    timeRemainingText: string;
    scheduledEnd?: string;
    hasAction?: boolean,
    actionLabel: string;
    actionIcon: string;
    onAction: () => void;
    isLoading?: boolean;
    onSecondaryAction?: () => void;
    isSecondaryLoading?: boolean;
}

/** Returns fraction of an hour remaining (0–1). >=60min returns 1. */
function getTimeFraction(scheduledEnd: string): number {
    const diffMs = new Date(scheduledEnd).getTime() - Date.now();
    if (diffMs <= 0) return 0;
    const diffMin = diffMs / (1000 * 60);
    return Math.min(diffMin / 60, 1);
}

export function BroadcastTile({
    user,
    vibe,
    timeRemainingText,
    scheduledEnd,
    actionLabel,
    actionIcon,
    onAction,
    hasAction = true,
    isLoading = false,
    onSecondaryAction,
    isSecondaryLoading = false,
}: BroadcastTileProps): React.JSX.Element {
    const name = user?.name || 'Someone';
    const firstInitial = name.charAt(0).toUpperCase();
    const vibePhrase = VIBE_WORDS.find(w => w.id === vibe)?.text || null;
    // Live countdown ring fraction
    const [fraction, setFraction] = useState(() =>
        scheduledEnd ? getTimeFraction(scheduledEnd) : 1
    );

    useEffect(() => {
        if (!scheduledEnd) return;
        setFraction(getTimeFraction(scheduledEnd));
        const interval = setInterval(() => {
            setFraction(getTimeFraction(scheduledEnd));
        }, 10_000); // update every 10s
        return () => clearInterval(interval);
    }, [scheduledEnd]);

    const strokeDashoffset = RING_CIRCUMFERENCE * (1 - fraction);

    return (
        <View style={styles.tile}>
            {/* Secondary action - X in top right */}
            {onSecondaryAction && (
                <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={onSecondaryAction}
                    disabled={isSecondaryLoading}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    {isSecondaryLoading ? (
                        <ActivityIndicator size="small" color="rgba(0,0,0,0.4)" />
                    ) : (
                        <IconSymbol name="xmark" size={12} color="rgba(0,0,0,0.4)" />
                    )}
                </TouchableOpacity>
            )}
            {/* Avatar with countdown ring */}
            <View style={styles.avatarRingWrapper}>
                <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
                    {/* Background track */}
                    <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke="rgba(0, 0, 0, 0.08)"
                        strokeWidth={RING_STROKE_WIDTH}
                        fill="transparent"
                    />
                    {/* Countdown arc */}
                    <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke={CORNFLOWER_BLUE}
                        strokeWidth={RING_STROKE_WIDTH}
                        fill="transparent"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation={-90}
                        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                    />
                </Svg>
                <View style={styles.avatarContainer}>
                    {user?.avatarUrl ? (
                        <Image
                            source={{ uri: user.avatarUrl }}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{firstInitial}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Name */}
            <Text style={styles.name} numberOfLines={1}>{name}</Text>

            {/* Vibe */}
            {vibe ? (
                <Text style={styles.vibe} numberOfLines={1}>{vibePhrase}</Text>
            ) : (
                <View style={styles.vibeSpacer} />
            )}

            {/* Time remaining */}
            {/* <Text style={styles.timeRemaining}>{timeRemainingText}</Text> */}

            {/* Primary action button */}
            {hasAction &&  <View>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onAction}
                disabled={isLoading}
                activeOpacity={0.7}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={CREAM} />
                ) : (
                    <View style={styles.actionRow}>
                        <IconSymbol name={actionIcon as any} size={14} color={CREAM} />
                        <Text style={styles.actionText}>{actionLabel}</Text>
                    </View>
                )}
            </TouchableOpacity>

            </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    tile: {
        width: TILE_WIDTH,
        backgroundColor: CREAM,//'rgba(30, 60, 114, 0.6)',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    avatarRingWrapper: {
        width: RING_SIZE,
        height: RING_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringSvg: {
        position: 'absolute',
    },
    avatarContainer: {
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: CREAM,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: CORNFLOWER_BLUE,
    },
    avatarInitial: {
        fontSize: 20,
        fontFamily: CustomFonts.ztnaturebold,
        color: BOLD_BLUE,
    },
    name: {
        fontSize: 15,
        fontFamily: CustomFonts.ztnaturebold,
        color: 'black',
        textAlign: 'center',
        marginBottom: 2,
    },
    vibe: {
        fontSize: 12,
        fontFamily: CustomFonts.ztnaturemedium,
        color: 'black',
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 2,
    },
    vibeSpacer: {
       // height: 16,
    },
    timeRemaining: {
        fontSize: 8,
        fontFamily: CustomFonts.ztnaturelight,
        color: 'black',
        opacity: 0.6,
        textAlign: 'center',
        marginBottom: 10,
    },
    actionButton: {
        backgroundColor: BOLD_BLUE,
        borderRadius: 14,
        paddingVertical: 7,
        paddingHorizontal: 14,
        minWidth: 100,
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    actionText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnaturemedium,
        color: 'black',
        fontWeight: '600',
    },
    dismissButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

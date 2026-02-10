import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, CREAM, CORNFLOWER_BLUE } from "@/styles/styles";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TILE_WIDTH = 140;
const AVATAR_SIZE = 48;

interface BroadcastTileUser {
    name?: string;
    avatarUrl?: string;
    id?: string;
}

interface BroadcastTileProps {
    user?: BroadcastTileUser;
    vibe?: string;
    timeRemainingText: string;
    actionLabel: string;
    actionIcon: string;
    onAction: () => void;
    isLoading?: boolean;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    isSecondaryLoading?: boolean;
}

export function BroadcastTile({
    user,
    vibe,
    timeRemainingText,
    actionLabel,
    actionIcon,
    onAction,
    isLoading = false,
    secondaryActionLabel,
    onSecondaryAction,
    isSecondaryLoading = false,
}: BroadcastTileProps): React.JSX.Element {
    const name = user?.name || 'Someone';
    const firstInitial = name.charAt(0).toUpperCase();

    return (
        <View style={styles.tile}>
            {/* Avatar */}
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

            {/* Name */}
            <Text style={styles.name} numberOfLines={1}>{name}</Text>

            {/* Vibe */}
            {vibe ? (
                <Text style={styles.vibe} numberOfLines={1}>{vibe}</Text>
            ) : (
                <View style={styles.vibeSpacer} />
            )}

            {/* Time remaining */}
            <Text style={styles.timeRemaining}>{timeRemainingText}</Text>

            {/* Primary action button */}
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

            {/* Secondary action (e.g. Unclaim) */}
            {secondaryActionLabel && onSecondaryAction && (
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onSecondaryAction}
                    disabled={isSecondaryLoading}
                    activeOpacity={0.7}
                >
                    {isSecondaryLoading ? (
                        <ActivityIndicator size="small" color={BOLD_BLUE} />
                    ) : (
                        <Text style={styles.secondaryText}>{secondaryActionLabel}</Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    tile: {
        width: TILE_WIDTH,
        backgroundColor: 'rgba(30, 60, 114, 0.6)',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    avatarContainer: {
        marginBottom: 8,
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
        color: CREAM,
        textAlign: 'center',
        marginBottom: 2,
    },
    vibe: {
        fontSize: 12,
        fontFamily: CustomFonts.ztnaturemedium,
        color: CREAM,
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 2,
    },
    vibeSpacer: {
        height: 16,
    },
    timeRemaining: {
        fontSize: 11,
        fontFamily: CustomFonts.ztnaturelight,
        color: CREAM,
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
        color: CREAM,
        fontWeight: '600',
    },
    secondaryButton: {
        marginTop: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    secondaryText: {
        fontSize: 11,
        fontFamily: CustomFonts.ztnaturelight,
        color: CREAM,
        opacity: 0.6,
    },
});

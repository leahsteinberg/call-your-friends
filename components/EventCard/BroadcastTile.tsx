import Avatar from "@/components/Avatar/Avatar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { CREAM } from "@/styles/styles";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const TILE_WIDTH = 140;
const AVATAR_SIZE = 70;

interface BroadcastTileUser {
    name?: string;
    avatarUrl?: string;
    id?: string;
}

interface BroadcastTileProps {
    user?: BroadcastTileUser;
    timeRemainingText: string;
    scheduledEnd?: string;
    hasAction?: boolean,
    actionLabel: string;
    actionIcon: string;
    onAction: () => void;
    isLoading?: boolean;
    onSecondaryAction?: () => void;
    isSecondaryLoading?: boolean;
    avatarChildren?: React.ReactNode;
    backgroundColor?: string;
    footer?: React.ReactNode;
}

export function BroadcastTile({
    user,
    timeRemainingText,
    scheduledEnd,
    actionLabel,
    actionIcon,
    onAction,
    hasAction = true,
    isLoading = false,
    onSecondaryAction,
    isSecondaryLoading = false,
    avatarChildren,
    backgroundColor = CREAM,
    footer,
}: BroadcastTileProps): React.JSX.Element {
    const name = user?.name || 'Someone';
    return (
        <View style={[styles.tile, {backgroundColor}]}>
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
            <Avatar name={name} avatarUrl={user?.avatarUrl} size={AVATAR_SIZE}>
                {avatarChildren}
            </Avatar>

            {/* Name */}
            <Text style={styles.name} numberOfLines={1}>{name}</Text>

            {/* Time remaining */}
            {/* <Text style={styles.timeRemaining}>{timeRemainingText}</Text> */}
                        
            {/* Footer content */}
            {footer}
            
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
                        <IconSymbol name={actionIcon as any} size={14} color={'black'} />
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
    name: {
        fontSize: 15,
        fontFamily: CustomFonts.ztnaturebold,
        color: 'black',
        textAlign: 'center',
        //marginBottom: 2,
        marginTop: 2,
    },
    actionButton: {
        //backgroundColor: BOLD_BLUE,
        borderRadius: 14,
        //paddingVertical: 7,
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

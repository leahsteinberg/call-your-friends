import { CustomFonts } from "@/constants/theme";
import { User } from "@/features/Auth/types";
import { endBroadcast, startBroadcast } from "@/features/Broadcast/broadcastSlice";
import { useBroadcastEndMutation, useBroadcastNowMutation } from "@/services/meetingApi";
import { CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { determineTargetType } from "@/utils/broadcastUtils";
import { getDisplayNameList } from "@/utils/nameStringUtils";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

interface MiniBroadcastButtonProps {
    targetUserIds: string[];
    targetUsers: Array<User | { id: string; name?: string }>;
    meetingId?: string;
    style?: ViewStyle;
}

export default function MiniBroadcastButton({
    targetUserIds,
    targetUsers,
    meetingId,
    style,
}: MiniBroadcastButtonProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const isBroadcasting = useSelector((state: RootState) => state.broadcast.isBroadcasting);

    const [broadcastNow] = useBroadcastNowMutation();
    const [broadcastEnd] = useBroadcastEndMutation();
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (isActive) {
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 800 }),
                    withTiming(1, { duration: 800 })
                ),
                -1,
                false
            );
        } else {
            pulseOpacity.value = withTiming(1, { duration: 300 });
        }
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    const getDisplayText = (): string => {
        if (isLoading) return "Starting...";

        if (isActive) {
            const names = getDisplayNameList(targetUsers as User[]);
            return `Broadcasting to ${names}`;
        }
        if (targetUsers.length === 1 && targetUsers[0].name) {
            return `Broadcast to ${targetUsers[0].name}`;
        }
        return "Broadcast to them";
    };

    const handlePress = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            // If already broadcasting globally, end that broadcast first
            if (isBroadcasting) {
                try {
                    await broadcastEnd({ userId }).unwrap();
                    dispatch(endBroadcast());
                } catch (endError) {
                    // Log but continue - server may have already ended it
                    console.log("Note: Could not end previous broadcast:", endError);
                }
            }

            // Start new broadcast to meeting participants
            const targetType = determineTargetType(targetUserIds);
            await broadcastNow({
                userId,
                targetUserIds: targetUserIds.length > 0 ? targetUserIds : undefined,
                targetType,
            }).unwrap();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            dispatch(startBroadcast());
            setIsActive(true);
        } catch (error) {
            console.error("Error starting broadcast:", error);
            Alert.alert("Broadcast Failed", "Unable to start broadcast. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Animated.View style={[animatedStyle, style]}>
            <TouchableOpacity
                style={[
                    styles.button,
                    isActive && styles.buttonActive,
                ]}
                onPress={handlePress}
                disabled={isLoading}
                activeOpacity={0.7}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={CREAM} />
                ) : (
                    <Text style={styles.buttonText}>{getDisplayText()}</Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: PALE_BLUE,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    buttonActive: {
        backgroundColor: CORNFLOWER_BLUE,
    },
    buttonText: {
        color: CREAM,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: CustomFonts.ztnaturemedium,
    },
});

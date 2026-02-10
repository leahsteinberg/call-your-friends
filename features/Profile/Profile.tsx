import BroadcastToggle from "@/components/BroadcastToggle";
import { CustomFonts } from "@/constants/theme";
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { BOLD_BLUE, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from "react-redux";
import { BroadcastSettingsProvider, useBroadcastSettings } from "../Broadcast/BroadcastSettingsContext";
import BroadcastList from "../Today/BroadcastList";
import TodayList from "../Today/TodayList";

const safePadding = Platform.OS === 'ios' ? 60 : 10;

const AVATAR_SIZE = 38;

function ProfileContent(): React.JSX.Element {
    const userName = useSelector((state: RootState) => state.auth.user.name);
    const avatarUrl = useSelector((state: RootState) => state.auth.user.avatarUrl);
    const { handleStartBroadcast, handleEndBroadcast, setIsCustomizing } = useBroadcastSettings();
    const { isLoading: meetingsLoading } = useProcessedMeetings();

    const firstInitial = userName ? userName.charAt(0).toUpperCase() : '?';
    const getGreetingText = () => {return userName ? `Hi, ${userName}` : 'Loyal';}

    const onCustomizeBroadcast = useCallback(() => {
        setIsCustomizing(true);
    }, [setIsCustomizing]);

    const onStartBroadcast = useCallback(async () => {
        try {
            await handleStartBroadcast();
        } catch (error) {
            // Error already logged in context
        }
    }, [handleStartBroadcast]);

    const onEndBroadcast = useCallback(async () => {
        await handleEndBroadcast();
    }, [handleEndBroadcast]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.greetingContainer}>
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{firstInitial}</Text>
                        </View>
                    )}
                    <Text style={styles.greetingText}>{getGreetingText()}</Text>
                </View>
                <View style={styles.toggleContainer}>
                    {!meetingsLoading && (
                        <BroadcastToggle
                            onCustomizeBroadcast={onCustomizeBroadcast}
                            onStartBroadcast={onStartBroadcast}
                            onEndBroadcast={onEndBroadcast}
                        />
                    )}
                </View>
            </View>
            <BroadcastList/>
            <TodayList />
        </View>
    );
}

export default function Profile(): React.JSX.Element {
    return (
        <BroadcastSettingsProvider>
            <ProfileContent />
        </BroadcastSettingsProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        minWidth: 300,
        maxHeight: '100%',
        maxWidth: '100%',
        width: '100%',
        justifyContent: 'space-between',
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        zIndex: 99,
        paddingBottom: 8,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginHorizontal: 15,
    },
    greetingContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
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
        backgroundColor: BOLD_BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 18,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
    },
    greetingText: {
        paddingTop: 10,
        color: CREAM,
        fontFamily: CustomFonts.awalierregular,
        letterSpacing: 3,
        fontSize: 35,
        fontWeight: '600',
        flexShrink: 1,
    },
    toggleContainer: {
    },
});

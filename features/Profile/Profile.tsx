import { CustomFonts } from "@/constants/theme";
import { BroadcastSettingsProvider, useBroadcastSettings } from '@/features/Broadcast/BroadcastSettingsContext';
import BroadcastToggle from '@/features/Broadcast/BroadcastToggle';
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { BOLD_BLUE, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useCallback } from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from "react-redux";
import BroadcastList from "./Today/BroadcastList";
import TodayList from "./Today/TodayList";

const safePadding = Platform.OS === 'ios' ? 60 : 10;

const AVATAR_SIZE = 38;

function ProfileContent(): React.JSX.Element {
    const userName = useSelector((state: RootState) => state.auth.user.name);
    const user = useSelector((state: RootState) => state.auth.user)
    console.log("user object - ", user);
    const avatarUrl = useSelector((state: RootState) => state.auth.user.avatarUrl);
    const { handleStartBroadcast, handleEndBroadcast, setIsCustomizing, isCustomizing } = useBroadcastSettings();
    const { isLoading: meetingsLoading } = useProcessedMeetings();

    const firstInitial = userName ? userName.charAt(0).toUpperCase() : '?';
    const getGreetingText = () => {return userName ? `Hi, ${userName}` : 'Call Your Friends';}

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
                <View style={styles.headerItem}>
                    <Text style={styles.greetingText}>{getGreetingText()}</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={styles.titleText}>Call Your Friends</Text>
                </View>
                <View style={styles.headerItem}>
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
        alignItems: 'center',
        //marginHorizontal: 15,
    },
    headerItem: {
        flex: 1,
        marginLeft: 20,
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    titleText: {
        textAlign: 'center',
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 24,
        color: CREAM,
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
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
        letterSpacing: 2,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'left',
    },
});

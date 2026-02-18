import { CustomFonts } from "@/constants/theme";
import { BroadcastSettingsProvider, useBroadcastSettings } from '@/features/Broadcast/BroadcastSettingsContext';
import BroadcastToggle from '@/features/Broadcast/BroadcastToggle';
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { CREAM } from "@/styles/styles";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from 'react-native';
import BroadcastList from "./Today/BroadcastList";
import TodayList from "./Today/TodayList";

function ProfileContent(): React.JSX.Element {
    const { handleStartBroadcast, handleEndBroadcast, setIsCustomizing, isCustomizing } = useBroadcastSettings();
    const { isLoading: meetingsLoading } = useProcessedMeetings();

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
            <View style={styles.titleWrapper}>
                    <Text style={styles.titleText}>Call Your Friends</Text>
                </View>
                {!meetingsLoading && (
                    <BroadcastToggle
                        onCustomizeBroadcast={onCustomizeBroadcast}
                        onStartBroadcast={onStartBroadcast}
                        onEndBroadcast={onEndBroadcast}
                    />
                )}

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
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleWrapper: {
       // flex: 1,
        //alignItems: 'flex-end',
    },
    titleText: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 22,
        color: CREAM,
        textAlign: 'right',
    },
});

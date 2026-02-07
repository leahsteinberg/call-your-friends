import BroadcastToggle from "@/components/BroadcastToggle";
import { CustomFonts } from "@/constants/theme";
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useCallback } from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from "react-redux";
import { BroadcastSettingsProvider, useBroadcastSettings } from "../Broadcast/BroadcastSettingsContext";
import TodayList from "../Today/TodayList";

const safePadding = Platform.OS === 'ios' ? 60 : 10;

function ProfileContent(): React.JSX.Element {
    const userName = useSelector((state: RootState) => state.auth.user.name);
    const { handleStartBroadcast, handleEndBroadcast, setIsCustomizing } = useBroadcastSettings();
    const { isLoading: meetingsLoading } = useProcessedMeetings();

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
        //backgroundColor: 'red',
    },
    greetingText: {
        paddingTop: 10,
        //paddingLeft: 20,
        color: CREAM,
        fontFamily: CustomFonts.awalierregular,
        letterSpacing: 3,
        fontSize: 35,
        fontWeight: '600',
    },
    toggleContainer: {
        //paddingTop: 35,
    },
    component: {

    }
});

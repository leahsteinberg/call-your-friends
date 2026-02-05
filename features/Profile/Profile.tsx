import BroadcastToggle from "@/components/BroadcastToggle";
import { CustomFonts } from "@/constants/theme";
import { useBroadcastEndMutation, useBroadcastNowMutation } from "@/services/meetingApi";
import { CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useCallback, useState } from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast, startBroadcast } from "../Broadcast/broadcastSlice";
import TodayList from "../Today/TodayList";

const safePadding = Platform.OS === 'ios' ? 60 : 10;

export default function Profile(): React.JSX.Element {
    const dispatch = useDispatch();
    const userName = useSelector((state: RootState) => state.auth.user.name);
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [broadcastNow] = useBroadcastNowMutation();
    const [broadcastEnd] = useBroadcastEndMutation();
    const [isCustomizing, setIsCustomizing] = useState(false);

    const getGreetingText = () => {return userName ? `Hi, ${userName}` : 'Loyal';}

    const handleCustomizeBroadcast = useCallback(() => {
        setIsCustomizing(true);
        // User can customize their broadcast settings here
    }, []);

    const handleStartBroadcast = useCallback(async () => {
        setIsCustomizing(false);
        dispatch(startBroadcast());
        try {
            await broadcastNow({ userId });
        } catch (error) {
            console.error("Error starting broadcast:", error);
            dispatch(endBroadcast());
        }
    }, [dispatch, broadcastNow, userId]);

    const handleEndBroadcast = useCallback(async () => {
        setIsCustomizing(false);
        dispatch(endBroadcast());
        try {
            await broadcastEnd({ userId });
        } catch (error) {
            console.error("Error ending broadcast:", error);
        }
    }, [dispatch, broadcastEnd, userId]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>{getGreetingText()}</Text>
                </View>
                <View style={styles.toggleContainer}>
                    <BroadcastToggle
                        onCustomizeBroadcast={handleCustomizeBroadcast}
                        onStartBroadcast={handleStartBroadcast}
                        onEndBroadcast={handleEndBroadcast}
                    />
                </View>
            </View>
            <TodayList />
        </View>
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
    },
    greetingText: {
        paddingTop: 30,
        paddingLeft: 20,
        color: CREAM,
        fontFamily: CustomFonts.awalierregular,
        letterSpacing: 3,
        fontSize: 50,
        fontWeight: '600',
    },
    toggleContainer: {
        paddingTop: 35,
        paddingRight: 10,
    },
    component: {

    }
});

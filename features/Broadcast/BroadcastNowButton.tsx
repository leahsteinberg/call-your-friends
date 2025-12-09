import { CustomFonts } from '@/constants/theme';
import { useBroadcastEndMutation, useBroadcastNowMutation } from "@/services/meetingApi";
import { DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import BroadcastDot from './BroadcastDot';
import { endBroadcast, startBroadcast } from "./broadcastSlice";


export default function BroadcastNowButton(): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const isEnabled: boolean = useSelector((state: RootState) => state.broadcast.isBroadcasting);
    const [broadcastNow] = useBroadcastNowMutation();
    const [broadcastEnd] = useBroadcastEndMutation();

    const handleToggle = async () => {
        const newValue = !isEnabled;
        if (newValue) {
            dispatch(startBroadcast());
            try {
                await broadcastNow({ userId });
                // RTK Query will auto-refresh via cache invalidation
            } catch (error) {
                console.error("Error broadcasting:", error);
                dispatch(endBroadcast());
            }
        } else {
            dispatch(endBroadcast());
            try {
                await broadcastEnd({ userId });
                // RTK Query will auto-refresh via cache invalidation
            } catch (error) {
                console.error("Error ending broadcast:", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <BroadcastDot
                onPress={handleToggle}
                isEnabled={isEnabled}
            />
            <Text style={styles.label}>Share you're open for calls</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginTop: 16,
        marginRight: 10,
        marginBottom: 4,
        borderRadius: 10,
    },
    label: {
        color: DARK_GREEN,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        fontFamily: CustomFonts.ztnaturebold,
    },
});

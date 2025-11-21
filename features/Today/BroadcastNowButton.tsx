import { useBroadcastEndMutation, useBroadcastNowMutation } from "@/services/meetingApi";
import { DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast, startBroadcast } from "../Broadcast/broadcastSlice";

export default function BroadcastNowButton({refresh}): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const isEnabled: boolean = useSelector((state: RootState) => state.broadcast.isBroadcasting);
    const [broadcastNow] = useBroadcastNowMutation();
    const [broadcastEnd] = useBroadcastEndMutation();

    const handleToggle = async (value: boolean) => {
        if (value) {
            dispatch(startBroadcast());
            try {
                await broadcastNow({ userId });
            } catch (error) {
                console.error("Error broadcasting:", error);
                dispatch(endBroadcast());
            }
        } else {
            dispatch(endBroadcast());
            try {
                await broadcastEnd({ userId });
            } catch (error) {
                console.error("Error ending broadcast:", error);
            }
        }
        refresh();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Find someone to talk to now</Text>
            {isEnabled && (
                <ActivityIndicator color={DARK_GREEN} style={styles.loader} />
            )}
            <Switch
                trackColor={{ false: '#767577', true: DARK_GREEN }}
                thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
                onValueChange={handleToggle}
                value={isEnabled}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    label: {
        color: DARK_GREEN,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    loader: {
        marginRight: 8,
    },
});

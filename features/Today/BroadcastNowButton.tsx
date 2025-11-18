import { useBroadcastNowMutation } from "@/services/meetingApi";
import { DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, View } from "react-native";
import { useSelector } from "react-redux";

export default function BroadcastNowButton(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [broadcastNow] = useBroadcastNowMutation();
    const [isEnabled, setIsEnabled] = useState(false);

    const handleToggle = async (value: boolean) => {
        setIsEnabled(value);
        if (value) {
            try {
                await broadcastNow({ userId });
                // Keep enabled indefinitely for now
            } catch (error) {
                console.error("Error broadcasting:", error);
                setIsEnabled(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>find someone to talk to now</Text>
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

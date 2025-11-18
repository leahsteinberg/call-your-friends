import { useBroadcastNowMutation } from "@/services/meetingApi";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";

export default function BroadcastNowButton(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [broadcastNow] = useBroadcastNowMutation();
    const [isLoading, setIsLoading] = useState(false);

    const handlePress = async () => {
        setIsLoading(true);
        try {
            await broadcastNow({ userId });
            // Keep loading indefinitely for now
        } catch (error) {
            console.error("Error broadcasting:", error);
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color={CREAM} />
            ) : (
                <Text style={styles.buttonText}>find someone to talk to now</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: DARK_GREEN,
        borderRadius: 100,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignSelf: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: CREAM,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});

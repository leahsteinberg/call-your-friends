import { useBroadcastNowMutation } from "@/services/meetingApi";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";

export default function BroadcastNowButton(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [broadcastNow, { isLoading }] = useBroadcastNowMutation();

    const handlePress = async () => {
        try {
            await broadcastNow({ userId });
        } catch (error) {
            console.error("Error broadcasting:", error);
        }
    };

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            disabled={isLoading}
        >
            <Text style={styles.buttonText}>
                {isLoading ? "..." : "find someone to talk to now"}
            </Text>
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

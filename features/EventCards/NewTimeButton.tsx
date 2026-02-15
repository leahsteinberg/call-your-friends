import { EventCard } from "@/components/EventCard/EventCard";
import ModalSelector from "@/components/ModalSelector/ModalSelector";
import { CustomFonts } from "@/constants/theme";
import { useSuggestNewTimeMutation } from "@/services/meetingApi";
import { BURGUNDY, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

type PresetModifier = "later_today" | "tomorrow" | "next_week";

const PRESET_OPTIONS: { modifier: PresetModifier; label: string }[] = [
    { modifier: "later_today", label: "Later today" },
    { modifier: "tomorrow", label: "Tomorrow" },
    { modifier: "next_week", label: "Next week" },
];

interface NewTimeButtonProps {
    meetingId: string;
    /** Text color for the trigger button label. Defaults to CREAM. */
    textColor?: string;
}

export default function NewTimeButton({ meetingId, textColor = CREAM }: NewTimeButtonProps): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [suggestNewTime] = useSuggestNewTimeMutation();
    const [isLoading, setIsLoading] = useState(false);
    const [customText, setCustomText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const handleSuggest = async (modifier: string) => {
        if (!modifier.trim()) return;
        try {
            setIsLoading(true);
            await suggestNewTime({ meetingId, userId, modifier }).unwrap();
            setCustomText("");
            setModalOpen(false);
        } catch (error) {
            console.error("Error suggesting new time:", error);
            alert("Failed to suggest a new time. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalSelector
            trigger={(onPress) => (
                <EventCard.Button
                    onPress={() => {
                        setModalOpen(true);
                        onPress();
                    }}
                    variant="ghost"
                    size="small"
                >
                    <Text style={[styles.triggerText, { color: textColor }]}>New time</Text>
                </EventCard.Button>
            )}
            visible={modalOpen}
            onClose={() => {
                setModalOpen(false);
                setCustomText("");
            }}
            horizontalAnchor="right"
            verticalAnchor="above"
            modalWidth={200}
            modalMaxHeight={300}
        >
            {/* Preset options */}
            {PRESET_OPTIONS.map(({ modifier, label }) => (
                <TouchableOpacity
                    key={modifier}
                    style={styles.optionRow}
                    onPress={() => handleSuggest(modifier)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    <Text style={styles.optionText}>{label}</Text>
                </TouchableOpacity>
            ))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Custom text input */}
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Friday evening"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    value={customText}
                    onChangeText={setCustomText}
                    onSubmitEditing={() => handleSuggest(customText)}
                    returnKeyType="send"
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!customText.trim() || isLoading) && styles.sendButtonDisabled]}
                    onPress={() => handleSuggest(customText)}
                    disabled={!customText.trim() || isLoading}
                    activeOpacity={0.7}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={CREAM} />
                    ) : (
                        <Text style={styles.sendButtonText}>Go</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ModalSelector>
    );
}

const styles = StyleSheet.create({
    triggerText: {
        fontSize: 12,
        fontWeight: "600",
        fontFamily: CustomFonts.ztnaturemedium,
    },
    optionRow: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 8,
    },
    optionText: {
        fontSize: 14,
        fontWeight: "500",
        color: BURGUNDY,
        fontFamily: CustomFonts.ztnaturemedium,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
        marginVertical: 8,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        color: BURGUNDY,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.15)",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    sendButton: {
        backgroundColor: BURGUNDY,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: {
        opacity: 0.4,
    },
    sendButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
    },
});

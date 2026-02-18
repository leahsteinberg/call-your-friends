import { EventCard } from "@/components/EventCard/EventCard";
import ModalSelector from "@/components/ModalSelector/ModalSelector";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { useSuggestNewTimeMutation } from "@/services/meetingApi";
import { BURGUNDY, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

interface Option {
    modifier: string;
    label: string;
}

/**
 * Returns 3 preset modifier options whose wording is relative to how far away
 * the meeting is.  All options are phrased relative to the meeting time, not
 * relative to "now", so the backend AI has clear guidance.
 *
 * Buckets (measured in whole calendar days from today to the meeting day):
 *   0      → meeting is today
 *   1      → meeting is tomorrow
 *   2-6    → meeting is later this week / a few days out
 *   7-13   → meeting is next week
 *   14+    → meeting is two+ weeks out
 */
function getPresetOptions(scheduledFor: string): Option[] {
    const now = new Date();
    const meetingDate = new Date(scheduledFor);

    // Strip time so we compare whole calendar days
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const meetingMidnight = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
    const daysOut = Math.round((meetingMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOut <= 0) {
        // Meeting is today
        return [
            { modifier: "later today",   label: "Later today" },
            { modifier: "tomorrow",       label: "Tomorrow" },
            { modifier: "next week",      label: "Next week" },
        ];
    }

    if (daysOut === 1) {
        // Meeting is tomorrow
        return [
            { modifier: "later that day",  label: "Later that day" },
            { modifier: "the day after",   label: "Day after" },
            { modifier: "next week",       label: "Next week" },
        ];
    }

    if (daysOut < 7) {
        // Meeting is a few days out (this week)
        return [
            { modifier: "a day later",         label: "A day later" },
            { modifier: "later that week",      label: "Later that week" },
            { modifier: "the following week",   label: "Following week" },
        ];
    }

    if (daysOut < 14) {
        // Meeting is next week
        return [
            { modifier: "a day later",         label: "A day later" },
            { modifier: "later that week",      label: "Later that week" },
            { modifier: "the week after",       label: "Week after" },
        ];
    }

    // Meeting is two or more weeks out
    return [
        { modifier: "a day later",       label: "A day later" },
        { modifier: "a week later",      label: "A week later" },
        { modifier: "two weeks later",   label: "Two weeks later" },
    ];
}

interface NewTimeButtonProps {
    meetingId: string;
    scheduledFor: string;
    /** Text color for the trigger button label. Defaults to CREAM. */
    textColor?: string;
}

export default function NewTimeButton({ meetingId, scheduledFor, textColor = CREAM }: NewTimeButtonProps): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [suggestNewTime] = useSuggestNewTimeMutation();
    const [isLoading, setIsLoading] = useState(false);
    const [customText, setCustomText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const presetOptions = getPresetOptions(scheduledFor);

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
                    <IconSymbol
                        name="clock"
                        fill="transparent"
                        style={[styles.triggerText, { color: textColor }]}
                    />
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
            {/* Dynamic preset options */}
            {presetOptions.map(({ modifier, label }) => (
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

            {/* Free-text input for custom modifier */}
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.textInput}
                    placeholder="anything else..."
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

import { EventCard } from "@/components/EventCard/EventCard";
import { CustomFonts } from "@/constants/theme";
import { useSuggestNewTimeMutation } from "@/services/meetingApi";
import { CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

type Modifier = "tomorrow" | "later_today" | "next_week";

const MODIFIER_LABELS: Record<Modifier, string> = {
    later_today: "Later today",
    tomorrow: "Tomorrow",
    next_week: "Next week",
};

interface NewTimeButtonProps {
    meetingId: string;
    /** Text color for the button labels. Defaults to CREAM. */
    textColor?: string;
}

export default function NewTimeButton({ meetingId, textColor = CREAM }: NewTimeButtonProps): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [suggestNewTime] = useSuggestNewTimeMutation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingModifier, setLoadingModifier] = useState<Modifier | null>(null);

    const handleSuggestNewTime = async (modifier: Modifier) => {
        try {
            setLoadingModifier(modifier);
            await suggestNewTime({ meetingId, userId, modifier }).unwrap();
            setIsExpanded(false);
            setLoadingModifier(null);
        } catch (error) {
            console.error("Error suggesting new time:", error);
            alert("Failed to suggest a new time. Please try again.");
            setLoadingModifier(null);
        }
    };

    if (!isExpanded) {
        return (
            <EventCard.Button
                onPress={() => setIsExpanded(true)}
                variant="ghost"
                size="small"
            >
                <Text style={[styles.buttonText, { color: textColor }]}>New time</Text>
            </EventCard.Button>
        );
    }

    return (
        <View style={styles.expandedContainer}>
            {(Object.keys(MODIFIER_LABELS) as Modifier[]).map((modifier) => (
                <EventCard.Button
                    key={modifier}
                    onPress={() => handleSuggestNewTime(modifier)}
                    loading={loadingModifier === modifier}
                    disabled={loadingModifier !== null}
                    variant="ghost"
                    size="small"
                >
                    <Text style={[styles.buttonText, { color: textColor }]}>
                        {MODIFIER_LABELS[modifier]}
                    </Text>
                </EventCard.Button>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    expandedContainer: {
        flexDirection: "row",
        gap: 6,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: "600",
        fontFamily: CustomFonts.ztnaturemedium,
    },
});

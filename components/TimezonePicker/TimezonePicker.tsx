import { CustomFonts } from '@/constants/theme';
import { BURGUNDY, CREAM, LIGHT_BURGUNDY, PALE_BLUE } from "@/styles/styles";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// US timezone options with friendly names
const US_TIMEZONES: { value: string; label: string }[] = [
    { value: "Pacific/Honolulu", label: "Hawaii" },
    { value: "America/Anchorage", label: "Alaska" },
    { value: "America/Los_Angeles", label: "Pacific" },
    { value: "America/Denver", label: "Mountain" },
    { value: "America/Chicago", label: "Central" },
    { value: "America/New_York", label: "Eastern" },
];

// Get friendly timezone name from IANA timezone
export const getFriendlyTimezoneName = (ianaTimezone: string): string => {
    const match = US_TIMEZONES.find(tz => tz.value === ianaTimezone);
    if (match) return match.label;

    // Try to match by offset/region for common US zones
    if (ianaTimezone.includes("Hawaii") || ianaTimezone.includes("Honolulu")) return "Hawaii";
    if (ianaTimezone.includes("Alaska") || ianaTimezone.includes("Anchorage")) return "Alaska";
    if (ianaTimezone.includes("Pacific") || ianaTimezone.includes("Los_Angeles")) return "Pacific";
    if (ianaTimezone.includes("Mountain") || ianaTimezone.includes("Denver")) return "Mountain";
    if (ianaTimezone.includes("Central") || ianaTimezone.includes("Chicago")) return "Central";
    if (ianaTimezone.includes("Eastern") || ianaTimezone.includes("New_York")) return "Eastern";

    // Fallback: return a simplified version
    return ianaTimezone.split('/').pop()?.replace(/_/g, ' ') || ianaTimezone;
};

// Detect user's timezone
export const detectUserTimezone = (): string => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return "America/New_York";
    }
};

interface TimezonePickerProps {
    selectedTimezone: string;
    onTimezoneChange: (timezone: string) => void;
}

export default function TimezonePicker({ selectedTimezone, onTimezoneChange }: TimezonePickerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const friendlyTimezone = getFriendlyTimezoneName(selectedTimezone);

    const handleSelect = (timezone: string) => {
        onTimezoneChange(timezone);
        setIsExpanded(false);
    };

    return (
        <View>
            <TouchableOpacity
                style={styles.displayRow}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.displayText}>
                    {friendlyTimezone} Time
                </Text>
                <Text style={styles.changeHint}>
                    {isExpanded ? 'done' : 'change'}
                </Text>
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.pickerContainer}>
                    {US_TIMEZONES.map(tz => (
                        <TouchableOpacity
                            key={tz.value}
                            style={[
                                styles.option,
                                selectedTimezone === tz.value && styles.optionSelected
                            ]}
                            onPress={() => handleSelect(tz.value)}
                        >
                            <Text style={[
                                styles.optionText,
                                selectedTimezone === tz.value && styles.optionTextSelected
                            ]}>
                                {tz.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    displayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    displayText: {
        fontSize: 16,
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
    },
    changeHint: {
        fontSize: 12,
        color: PALE_BLUE,
        fontFamily: CustomFonts.ztnaturemedium,
        marginLeft: 8,
        opacity: 0.8,
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 16,
        backgroundColor: LIGHT_BURGUNDY,
        padding: 12,
        borderRadius: 12,
    },
    option: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: CREAM,
    },
    optionSelected: {
        backgroundColor: CREAM,
    },
    optionText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnaturemedium,
        color: CREAM,
    },
    optionTextSelected: {
        color: BURGUNDY,
    },
});

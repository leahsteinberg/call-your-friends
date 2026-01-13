import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import CompactWheelPicker from "./CompactWheelPicker";

const TIME_OF_DAY_OPTIONS = ['MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING', 'NIGHT'];

// Generate day options starting from tomorrow
const generateDayOptions = () => {
    const days: string[] = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        days.push(`${dayName}, ${monthDay}`);
    }

    return days;
};

interface InlineTimePickerProps {
    onTimeChange?: (day: string, timeOfDay: string) => void;
}

export default function InlineTimePicker({ onTimeChange }: InlineTimePickerProps): React.JSX.Element {
    const dayOptions = generateDayOptions();

    // Default to Tomorrow (index 0) and EVENING (index 3)
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedTimeOfDayIndex, setSelectedTimeOfDayIndex] = useState(3);

    const handleDayChange = (index: number) => {
        setSelectedDayIndex(index);
        if (onTimeChange) {
            onTimeChange(dayOptions[index], TIME_OF_DAY_OPTIONS[selectedTimeOfDayIndex]);
        }
    };

    const handleTimeOfDayChange = (index: number) => {
        setSelectedTimeOfDayIndex(index);
        if (onTimeChange) {
            onTimeChange(dayOptions[selectedDayIndex], TIME_OF_DAY_OPTIONS[index]);
        }
    };

    return (
        <View style={styles.container}>
            <CompactWheelPicker
                items={dayOptions}
                selectedIndex={selectedDayIndex}
                onValueChange={handleDayChange}
                itemWidth={120}
                height={40}
            />
            <CompactWheelPicker
                items={TIME_OF_DAY_OPTIONS}
                selectedIndex={selectedTimeOfDayIndex}
                onValueChange={handleTimeOfDayChange}
                itemWidth={110}
                height={40}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
});

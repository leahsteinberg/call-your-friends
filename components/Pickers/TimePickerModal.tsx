import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WheelPicker from "./WheelPicker";

interface TimePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm?: (day: string, timeOfDay: string) => void;
}

const TIME_OF_DAY_OPTIONS = ['MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING', 'NIGHT'];

// Generate day options starting from tomorrow
const generateDayOptions = () => {
    const days: string[] = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        days.push(`${dayName}, ${monthDay}`);
    }

    return days;
};

export default function TimePickerModal({ visible, onClose, onConfirm }: TimePickerModalProps): React.JSX.Element {
    const dayOptions = generateDayOptions();

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedTimeOfDayIndex, setSelectedTimeOfDayIndex] = useState(0);

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(dayOptions[selectedDayIndex], TIME_OF_DAY_OPTIONS[selectedTimeOfDayIndex]);
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Select Time</Text>

                    <View style={styles.pickersContainer}>
                        {/* Day Picker */}
                        <View style={styles.pickerColumn}>
                            <Text style={styles.pickerLabel}>Day</Text>
                            <WheelPicker
                                items={dayOptions}
                                selectedIndex={selectedDayIndex}
                                onValueChange={setSelectedDayIndex}
                            />
                        </View>

                        {/* Time of Day Picker */}
                        <View style={styles.pickerColumn}>
                            <Text style={styles.pickerLabel}>Time</Text>
                            <WheelPicker
                                items={TIME_OF_DAY_OPTIONS}
                                selectedIndex={selectedTimeOfDayIndex}
                                onValueChange={setSelectedTimeOfDayIndex}
                            />
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: CREAM,
        borderRadius: 20,
        padding: 20,
        width: '85%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
        textAlign: 'center',
        marginBottom: 20,
    },
    pickersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },
    pickerColumn: {
        flex: 1,
    },
    pickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturemedium,
        textAlign: 'center',
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: PALE_BLUE,
        borderWidth: 2,
        borderColor: BOLD_BLUE,
    },
    confirmButton: {
        backgroundColor: BOLD_BLUE,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
    },
});

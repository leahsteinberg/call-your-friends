import { CustomFonts } from '@/constants/theme';
import { CORNFLOWER_BLUE, CREAM } from '@/styles/styles';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import PhoneNumberValidity from './PhoneNumberValidity';

interface PhoneNumberInputProps {
    onDataChange: (text: string) => void;
    phoneNumber: string;
}

export interface PhoneNumberInputRef {
    focusFirstInput: () => void;
}

const PhoneNumberInput = forwardRef<PhoneNumberInputRef, PhoneNumberInputProps>(({ onDataChange, phoneNumber }, ref) => {
    // Create refs for each digit input
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useImperativeHandle(ref, () => ({
        focusFirstInput: () => {
            inputRefs.current[0]?.focus();
        },
    }));

    // Convert phone number string to array of digits
    const digits = phoneNumber.padEnd(10, '').split('').slice(0, 10);

    const handleDigitChange = (text: string, index: number) => {
        // Only allow numeric input
        const numericText = text.replace(/[^0-9]/g, '');

        if (numericText.length === 0) {
            // Character was deleted
            const newDigits = [...digits];
            newDigits[index] = '';
            onDataChange(newDigits.join('').replace(/\s/g, ''));
            return;
        }

        // Handle paste of multiple digits
        if (numericText.length > 1) {
            const pastedDigits = numericText.slice(0, 10 - index);
            const newDigits = [...digits];
            for (let i = 0; i < pastedDigits.length && index + i < 10; i++) {
                newDigits[index + i] = pastedDigits[i];
            }
            onDataChange(newDigits.join('').replace(/\s/g, ''));

            // Focus the next empty input or the last one
            const nextIndex = Math.min(index + pastedDigits.length, 9);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        // Single digit entered
        const newDigits = [...digits];
        newDigits[index] = numericText;
        onDataChange(newDigits.join('').replace(/\s/g, ''));

        // Auto-advance to next input
        if (index < 9) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const renderDigitInput = (index: number) => (
        <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.digitInput}
            value={digits[index] || ''}
            onChangeText={(text) => handleDigitChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={2} // Allow 2 to detect when user types over existing
            selectTextOnFocus
            caretHidden={false}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.inputRow}>
                <Text style={styles.separator}>(</Text>
                {renderDigitInput(0)}
                {renderDigitInput(1)}
                {renderDigitInput(2)}
                <Text style={styles.separator}>)</Text>
                {renderDigitInput(3)}
                {renderDigitInput(4)}
                {renderDigitInput(5)}
                <Text style={styles.separator}>-</Text>
                {renderDigitInput(6)}
                {renderDigitInput(7)}
                {renderDigitInput(8)}
                {renderDigitInput(9)}
                <View style={styles.validityContainer}>
                    <PhoneNumberValidity phoneNumber={phoneNumber} />
                </View>
            </View>
        </View>
    );
});

export default PhoneNumberInput;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    digitInput: {
        flex: 1,
        maxWidth: 28,
        height: 44,
        backgroundColor: CREAM,
        borderRadius: 6,
        marginHorizontal: 1,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: CustomFonts.ztnatureregular,
        color: CORNFLOWER_BLUE,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    separator: {
        fontSize: 18,
        color: CORNFLOWER_BLUE,
        fontFamily: CustomFonts.ztnatureregular,
        marginHorizontal: 1,
    },
    spacer: {
        width: 6,
    },
});

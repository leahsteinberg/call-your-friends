import { CustomFonts } from "@/constants/theme";
import React, { useState } from "react";
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CallUserButtonProps {
    phoneNumber: string;
    userName?: string;
    onBeforeCall?: (phoneNumber: string) => Promise<void>;
    onCallError?: (error: Error) => void;
    buttonText?: string;
    style?: any;
    textStyle?: any;
    disabled?: boolean;
    showConfirmation?: boolean;
}

export default function CallUserButton({
    phoneNumber,
    userName,
    onBeforeCall,
    onCallError,
    buttonText,
    style,
    textStyle,
    disabled = false,
    showConfirmation = true,
}: CallUserButtonProps): React.JSX.Element {
    const [isLoading, setIsLoading] = useState(false);

    // Format phone number for display (e.g., +1 (234) 567-8900)
    const formatPhoneNumber = (number: string): string => {
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        if (cleaned.length === 11 && cleaned[0] === '1') {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        return number;
    };

    const initiateCall = async () => {
        try {
            setIsLoading(true);

            // Call the API logging callback if provided
            if (onBeforeCall) {
                await onBeforeCall(phoneNumber);
            }

            // Clean phone number for dialing (remove all non-numeric characters except +)
            const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, '');
            const phoneUrl = `tel:${cleanedNumber}`;

            // Check if the device can make phone calls
            const canOpen = await Linking.canOpenURL(phoneUrl);

            if (!canOpen) {
                Alert.alert(
                    'Cannot Make Call',
                    'This device cannot make phone calls.',
                    [{ text: 'OK' }]
                );
                setIsLoading(false);
                return;
            }

            // Initiate the phone call
            await Linking.openURL(phoneUrl);
            setIsLoading(false);

        } catch (error) {
            console.error('Error making call:', error);
            setIsLoading(false);

            if (onCallError) {
                onCallError(error as Error);
            }

            Alert.alert(
                'Call Failed',
                'Unable to initiate the call. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handlePress = () => {
        if (disabled || isLoading) return;

        if (showConfirmation) {
            const displayName = userName || formatPhoneNumber(phoneNumber);
            Alert.alert(
                'Make Call',
                `Call ${displayName}?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Call',
                        onPress: initiateCall,
                    },
                ],
                { cancelable: true }
            );
        } else {
            initiateCall();
        }
    };

    const getButtonText = () => {
        if (isLoading) return 'Calling...';
        if (buttonText) return buttonText;
        if (userName) return `Call ${userName}`;
        return 'Call';
    };

    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled, style]}
            onPress={handlePress}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
        >
            <Text style={[styles.buttonText, textStyle]}>
                {getButtonText()}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
});

import { CustomFonts } from "@/constants/theme";
import { useEndCallMutation, useLogCallErrorMutation, useStartCallMutation } from "@/services/callLoggingApi";
import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, AppStateStatus, Linking, StyleSheet, Text, TouchableOpacity } from "react-native";

interface CallUserButtonProps {
    phoneNumber: string;
    userName?: string;

    // Required for call logging
    userId: string;
    participantId: string;
    meetingId?: string;

    // Optional callbacks (kept for backward compatibility but not needed)
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
    userId,
    participantId,
    meetingId,
    onBeforeCall,
    onCallError,
    buttonText,
    style,
    textStyle,
    disabled = false,
    showConfirmation = true,
}: CallUserButtonProps): React.JSX.Element {
    const [isLoading, setIsLoading] = useState(false);

    // Call logging hooks
    const [startCall] = useStartCallMutation();
    const [endCall] = useEndCallMutation();
    const [logCallError] = useLogCallErrorMutation();

    // State for tracking calls
    const [callStartTime, setCallStartTime] = useState<Date | null>(null);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const callLogIdRef = useRef<string | null>(null);

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

    // Monitor app state to detect when user returns from phone call
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [callStartTime, participantId, meetingId]);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        // User returned to app after making a call
        if (appState.match(/inactive|background/) && nextAppState === 'active' && callStartTime) {
            const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);

            // Log call end
            try {
                await endCall({
                    userId,
                    participantId,
                    meetingId,
                    duration,
                    endReason: 'completed',
                }).unwrap();
                console.log(`Call end logged successfully. Duration: ${duration}s`);
            } catch (error) {
                console.error('Error logging call end:', error);
            }

            // Reset state
            setCallStartTime(null);
            callLogIdRef.current = null;
        }
        setAppState(nextAppState);
    };

    const initiateCall = async () => {
        try {
            setIsLoading(true);

            // 1. Log call start (BEFORE opening dialer)
            try {
                const result = await startCall({
                    userId,
                    participantId,
                    meetingId,
                    callType: 'phone',
                }).unwrap();

                callLogIdRef.current = result.id;
                setCallStartTime(new Date());
                console.log(`Call start logged with ID: ${result.id}`);
            } catch (apiError) {
                console.error('Error logging call start:', apiError);
                // Continue with call even if logging fails
            }

            // 2. Call the legacy callback if provided (for backward compatibility)
            if (onBeforeCall) {
                await onBeforeCall(phoneNumber);
            }

            // 3. Clean phone number for dialing (remove all non-numeric characters except +)
            const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, '');
            const phoneUrl = `tel:${cleanedNumber}`;

            // 4. Check if the device can make phone calls
            const canOpen = await Linking.canOpenURL(phoneUrl);

            if (!canOpen) {
                // Log error
                await logCallError({
                    userId,
                    participantId,
                    meetingId,
                    errorMessage: 'Device cannot make phone calls',
                    errorCode: 'DEVICE_UNSUPPORTED',
                }).unwrap().catch(err => console.error('Error logging call error:', err));

                Alert.alert(
                    'Cannot Make Call',
                    'This device cannot make phone calls.',
                    [{ text: 'OK' }]
                );
                setIsLoading(false);
                setCallStartTime(null);
                return;
            }

            // 5. Initiate the phone call
            await Linking.openURL(phoneUrl);
            setIsLoading(false);

        } catch (error) {
            console.error('Error making call:', error);
            setIsLoading(false);
            setCallStartTime(null);

            // Log the error
            try {
                await logCallError({
                    userId,
                    participantId,
                    meetingId,
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    errorCode: 'CALL_INITIATION_FAILED',
                }).unwrap();
            } catch (logError) {
                console.error('Error logging call error:', logError);
            }

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
        if (userName) return `Call ${userName}`;
        if (buttonText) return buttonText;
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

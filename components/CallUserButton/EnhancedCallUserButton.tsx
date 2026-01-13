import { CustomFonts } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { Alert, AppState, AppStateStatus, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CallLog {
    timestamp: Date;
    duration?: number;
    notes?: string;
}

interface EnhancedCallUserButtonProps {
    phoneNumber: string;
    userName?: string;
    lastCallTime?: Date;
    onBeforeCall?: (phoneNumber: string) => Promise<void>;
    onCallCompleted?: (callLog: CallLog) => Promise<void>;
    onCallError?: (error: Error) => void;
    buttonText?: string;
    style?: any;
    textStyle?: any;
    disabled?: boolean;
    showConfirmation?: boolean;
    showLastCallTime?: boolean;
    enablePostCallFeedback?: boolean;
    alternativeContactMethods?: Array<{
        type: 'facetime' | 'whatsapp' | 'zoom';
        identifier: string;
        label: string;
    }>;
}

export default function EnhancedCallUserButton({
    phoneNumber,
    userName,
    lastCallTime,
    onBeforeCall,
    onCallCompleted,
    onCallError,
    buttonText,
    style,
    textStyle,
    disabled = false,
    showConfirmation = true,
    showLastCallTime = true,
    enablePostCallFeedback = true,
    alternativeContactMethods = [],
}: EnhancedCallUserButtonProps): React.JSX.Element {
    const [isLoading, setIsLoading] = useState(false);
    const [callStartTime, setCallStartTime] = useState<Date | null>(null);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    // Format phone number for display
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

    // Format relative time (e.g., "2 hours ago", "yesterday")
    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    // Monitor app state to detect when user returns from phone app
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [callStartTime]);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        // User returned to app after making a call
        if (appState.match(/inactive|background/) && nextAppState === 'active' && callStartTime && enablePostCallFeedback) {
            const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
            // Wait a bit for the phone app to fully close
            setTimeout(() => {
                showPostCallFeedback(duration);
            }, 500);
        }
        setAppState(nextAppState);
    };

    const showPostCallFeedback = (duration: number) => {
        Alert.alert(
            'How was your call?',
            `You were on the call for ${Math.floor(duration / 60)} minutes`,
            [
                {
                    text: 'Add Note',
                    onPress: () => {
                        // In a real implementation, show a modal for notes
                        Alert.prompt(
                            'Call Notes',
                            'Add any notes about this call',
                            async (notes) => {
                                if (onCallCompleted) {
                                    await onCallCompleted({
                                        timestamp: callStartTime!,
                                        duration,
                                        notes,
                                    });
                                }
                                setCallStartTime(null);
                            }
                        );
                    },
                },
                {
                    text: 'Done',
                    onPress: async () => {
                        if (onCallCompleted) {
                            await onCallCompleted({
                                timestamp: callStartTime!,
                                duration,
                            });
                        }
                        setCallStartTime(null);
                    },
                },
            ]
        );
    };

    const initiateCall = async () => {
        try {
            setIsLoading(true);

            // Call the API logging callback if provided
            if (onBeforeCall) {
                await onBeforeCall(phoneNumber);
            }

            // Clean phone number for dialing
            const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, '');
            const phoneUrl = `tel:${cleanedNumber}`;

            // Check if the device can make phone calls
            const canOpen = await Linking.canOpenURL(phoneUrl);

            if (!canOpen) {
                // Show alternative contact methods if available
                if (alternativeContactMethods.length > 0) {
                    showAlternativeContactMethods();
                } else {
                    Alert.alert(
                        'Cannot Make Call',
                        'This device cannot make phone calls.',
                        [{ text: 'OK' }]
                    );
                }
                setIsLoading(false);
                return;
            }

            // Mark call start time for duration tracking
            setCallStartTime(new Date());

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

    const showAlternativeContactMethods = () => {
        const buttons = alternativeContactMethods.map(method => ({
            text: method.label,
            onPress: () => handleAlternativeContact(method),
        }));

        buttons.push({ text: 'Cancel', onPress: () => {} });

        Alert.alert(
            'Choose Contact Method',
            'Phone calls are not available. Try another method?',
            buttons as any
        );
    };

    const handleAlternativeContact = async (method: any) => {
        try {
            let url = '';
            switch (method.type) {
                case 'facetime':
                    url = `facetime:${method.identifier}`;
                    break;
                case 'whatsapp':
                    url = `whatsapp://send?phone=${method.identifier}`;
                    break;
                case 'zoom':
                    url = method.identifier; // Full zoom URL
                    break;
            }

            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Not Available', `${method.label} is not available on this device.`);
            }
        } catch (error) {
            console.error('Error opening alternative contact:', error);
        }
    };

    const handlePress = () => {
        if (disabled || isLoading) return;

        if (showConfirmation) {
            const displayName = userName || formatPhoneNumber(phoneNumber);
            const message = lastCallTime && showLastCallTime
                ? `Call ${displayName}?\n\nLast called: ${formatRelativeTime(lastCallTime)}`
                : `Call ${displayName}?`;

            Alert.alert(
                'Make Call',
                message,
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

    const handleLongPress = () => {
        if (alternativeContactMethods.length > 0) {
            showAlternativeContactMethods();
        }
    };

    const getButtonText = () => {
        if (isLoading) return 'Calling...';
        if (buttonText) return buttonText;
        if (userName) return `Call ${userName}`;
        return 'Call';
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.button, disabled && styles.buttonDisabled, style]}
                onPress={handlePress}
                onLongPress={handleLongPress}
                disabled={disabled || isLoading}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, textStyle]}>
                    {getButtonText()}
                </Text>
            </TouchableOpacity>

            {lastCallTime && showLastCallTime && !isLoading && (
                <Text style={styles.lastCallText}>
                    Last called {formatRelativeTime(lastCallTime)}
                </Text>
            )}
        </View>
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
    lastCallText: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
        fontFamily: CustomFonts.ztnaturelight,
    },
});

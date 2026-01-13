/**
 * Example usage of CallUserButton component
 *
 * This file demonstrates how to use the CallUserButton with API logging
 */

import React from 'react';
import { View } from 'react-native';
import CallUserButton from './CallUserButton';

// Example API call function (adjust to your actual API)
const logCallToAPI = async (phoneNumber: string, userId: string, meetingId?: string) => {
    try {
        const response = await fetch('YOUR_API_ENDPOINT/log-call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                phoneNumber,
                meetingId,
                timestamp: new Date().toISOString(),
                platform: 'mobile',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to log call');
        }

        return await response.json();
    } catch (error) {
        console.error('Error logging call:', error);
        // Optionally: still allow the call to proceed even if logging fails
        // throw error; // Uncomment if you want to block the call on logging failure
    }
};

// Example 1: Simple usage with confirmation
export const SimpleCallButton = () => {
    return (
        <CallUserButton
            phoneNumber="+12345678900"
            userName="John Doe"
        />
    );
};

// Example 2: With API logging
export const CallButtonWithLogging = ({ userId, meetingId }: { userId: string; meetingId?: string }) => {
    const handleBeforeCall = async (phoneNumber: string) => {
        await logCallToAPI(phoneNumber, userId, meetingId);
    };

    return (
        <CallUserButton
            phoneNumber="+12345678900"
            userName="John Doe"
            onBeforeCall={handleBeforeCall}
            onCallError={(error) => {
                console.error('Call error:', error);
                // Could show toast notification here
            }}
        />
    );
};

// Example 3: No confirmation dialog (quick dial)
export const QuickDialButton = () => {
    return (
        <CallUserButton
            phoneNumber="+12345678900"
            userName="Jane Smith"
            showConfirmation={false}
            buttonText="Quick Call"
        />
    );
};

// Example 4: Custom styling
export const CustomStyledButton = () => {
    return (
        <CallUserButton
            phoneNumber="+12345678900"
            userName="Jane Smith"
            style={{
                backgroundColor: '#4CAF50',
                borderRadius: 20,
                paddingHorizontal: 24,
            }}
            textStyle={{
                fontSize: 16,
                fontWeight: 'bold',
            }}
        />
    );
};

// Example 5: Integration with event card
export const EventCardCallButton = ({ meeting, userId }: any) => {
    const handleBeforeCall = async (phoneNumber: string) => {
        // Log the call with meeting context
        await logCallToAPI(phoneNumber, userId, meeting.id);
    };

    return (
        <View style={{ marginTop: 8 }}>
            <CallUserButton
                phoneNumber={meeting.userFrom?.phoneNumber}
                userName={meeting.userFrom?.name}
                onBeforeCall={handleBeforeCall}
                buttonText="Call Now"
            />
        </View>
    );
};

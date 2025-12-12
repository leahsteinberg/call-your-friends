import { CustomFonts } from '@/constants/theme';
import { BURGUNDY, BRIGHT_GREEN, PEACH } from '@/styles/styles';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MessageDisplayProps {
    message: string;
    type: 'error' | 'success' | 'info';
}

export default function MessageDisplay({ message, type }: MessageDisplayProps): React.JSX.Element | null {
    if (!message) return null;

    const backgroundColor = type === 'error' ? PEACH : type === 'success' ? BRIGHT_GREEN : '#e8f4f8';
    const textColor = type === 'error' ? BURGUNDY : '#2d5016';

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <Text style={[styles.message, { color: textColor }]}>
                {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        fontFamily: CustomFonts.ztnatureregular,
        fontWeight: '600',
    },
});

import { CustomFonts } from '@/constants/theme';
import { CREAM } from '@/styles/styles';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GoButtonProps {
    onPress: () => void;
    disabled?: boolean;
    text?: string;
}

// Neumorphic styling constants
const NEUMORPHIC = {
    lightShadow: CREAM,
    darkShadow: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: 6,
    shadowBlur: 12,
};

export default function GoButton({
    onPress,
    disabled = false,
    text = 'Call Me',
}: GoButtonProps): React.JSX.Element {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, disabled && styles.buttonDisabled]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>CALL</Text>
                <Text style={styles.buttonText}>ME</Text>

            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        ...Platform.select({
            ios: {
                shadowColor: NEUMORPHIC.darkShadow,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: `-${NEUMORPHIC.shadowOffset}px -${NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowBlur}px ${NEUMORPHIC.lightShadow}, ${NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowBlur}px ${NEUMORPHIC.darkShadow}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            },
        }),
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 32,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
        letterSpacing: 2,
        textAlign: 'center',
    },
});

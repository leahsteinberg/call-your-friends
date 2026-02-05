import { CustomFonts } from '@/constants/theme';
import { CORNFLOWER_BLUE, CREAM } from '@/styles/styles';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface UserEmailPasswordInputProps {
    onChangeEmail: (text: string) => void;
    onChangePassword: (text: string) => void;
    onSubmitPassword?: () => void;
    validatePassword?: boolean;
    onPasswordValidityChange?: (isValid: boolean) => void;
}

const MIN_PASSWORD_LENGTH = 8;

export default function UserEmailPasswordInput({ onChangeEmail, onChangePassword, onSubmitPassword, validatePassword, onPasswordValidityChange }: UserEmailPasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [hasInteracted, setHasInteracted] = useState(false);
    const passwordRef = useRef<TextInput>(null);

    const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;
    const showError = validatePassword && hasInteracted && password.length > 0 && !isPasswordValid;

    useEffect(() => {
        if (validatePassword && onPasswordValidityChange) {
            onPasswordValidityChange(isPasswordValid);
        }
    }, [isPasswordValid, validatePassword, onPasswordValidityChange]);

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setHasInteracted(true);
        onChangePassword(text);
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Email address"
                placeholderTextColor={CORNFLOWER_BLUE + '80'}
                style={styles.textInput}
                onChangeText={(text) => onChangeEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <View style={[styles.passwordContainer, showError && styles.passwordContainerError]}>
                <TextInput
                    ref={passwordRef}
                    placeholder="Password"
                    placeholderTextColor={CORNFLOWER_BLUE + '80'}
                    style={styles.passwordInput}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={onSubmitPassword}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {showPassword ? (
                        <EyeOff size={20} color={CORNFLOWER_BLUE} />
                    ) : (
                        <Eye size={20} color={CORNFLOWER_BLUE} />
                    )}
                </TouchableOpacity>
            </View>
            {showError && (
                <Text style={styles.errorText}>
                    Password must be at least {MIN_PASSWORD_LENGTH} characters
                </Text>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    textInput: {
        borderRadius: 8,
        padding: 14,
        backgroundColor: CREAM,
        color: CORNFLOWER_BLUE,
        fontSize: 16,
        fontFamily: CustomFonts.ztnatureregular,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CREAM,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    passwordContainerError: {
        borderColor: '#DC3545',
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        color: CORNFLOWER_BLUE,
        fontSize: 16,
        fontFamily: CustomFonts.ztnatureregular,
    },
    eyeButton: {
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    errorText: {
        color: '#DC3545',
        fontSize: 12,
        fontFamily: CustomFonts.ztnatureregular,
        marginTop: 4,
    },
});

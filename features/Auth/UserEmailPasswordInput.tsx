import { CustomFonts } from '@/constants/theme';
import { CORNFLOWER_BLUE, CREAM } from '@/styles/styles';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface UserEmailPasswordInputProps {
    onChangeEmail: (text: string) => void;
    onChangePassword: (text: string) => void;
}

export default function UserEmailPasswordInput({ onChangeEmail, onChangePassword }: UserEmailPasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

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
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    placeholder="Password"
                    placeholderTextColor={CORNFLOWER_BLUE + '80'}
                    style={styles.passwordInput}
                    onChangeText={(text) => onChangePassword(text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
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
});

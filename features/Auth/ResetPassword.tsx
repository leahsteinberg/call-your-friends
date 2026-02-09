import FlowerBlob from '@/assets/images/flower-blob.svg';
import { CustomFonts } from '@/constants/theme';
import { usePostForgotPasswordMutation, usePostResetPasswordMutation } from '@/services/authApi';
import { CORNFLOWER_BLUE, CREAM, ORANGE, PALE_BLUE } from '@/styles/styles';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import EntryButton from './EntryButton';
import MessageDisplay from './MessageDisplay';

const safePadding = Platform.OS === 'ios' ? 60 : 10;
const OTP_LENGTH = 6;

const ERROR_MESSAGES: Record<string, string> = {
    OTP_EXPIRED: 'Your code has expired. Tap "Resend code" to get a new one.',
    INVALID_OTP: 'That code doesn\'t match. Please double-check and try again.',
    USER_NOT_FOUND: 'We couldn\'t find an account with that email address.',
    TOO_MANY_ATTEMPTS: 'Too many attempts. Please wait a few minutes before trying again.',
};

export function ResetPassword() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const router = useRouter();

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const [resetPassword] = usePostResetPasswordMutation();
    const [forgotPassword] = usePostForgotPasswordMutation();

    const otpRefs = useRef<(TextInput | null)[]>([]);
    const passwordRef = useRef<TextInput>(null);

    const otpDigits = otp.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH);

    const handleOtpChange = (text: string, index: number) => {
        const numericText = text.replace(/[^0-9]/g, '');

        if (numericText.length === 0) {
            const newDigits = [...otpDigits];
            newDigits[index] = '';
            setOtp(newDigits.join('').replace(/\s/g, ''));
            return;
        }

        // Handle paste of multiple digits
        if (numericText.length > 1) {
            const pastedDigits = numericText.slice(0, OTP_LENGTH - index);
            const newDigits = [...otpDigits];
            for (let i = 0; i < pastedDigits.length && index + i < OTP_LENGTH; i++) {
                newDigits[index + i] = pastedDigits[i];
            }
            const newOtp = newDigits.join('').replace(/\s/g, '');
            setOtp(newOtp);
            const nextIndex = Math.min(index + pastedDigits.length, OTP_LENGTH - 1);
            if (newOtp.length === OTP_LENGTH) {
                passwordRef.current?.focus();
            } else {
                otpRefs.current[nextIndex]?.focus();
            }
            return;
        }

        const newDigits = [...otpDigits];
        newDigits[index] = numericText;
        const newOtp = newDigits.join('').replace(/\s/g, '');
        setOtp(newOtp);

        if (index < OTP_LENGTH - 1) {
            otpRefs.current[index + 1]?.focus();
        } else {
            passwordRef.current?.focus();
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (otp.length !== OTP_LENGTH) {
            setErrorMessage('Please enter the full 6-digit code.');
            return;
        }
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword({ email, otp, password }).unwrap();
            setSuccessMessage('Password reset successfully!');
            // Navigate back to login after a short delay
            setTimeout(() => router.replace('/login'), 1500);
        } catch (error: any) {
            console.error('Reset password error:', error);
            const code = error.data?.code;
            if (error.status === 'FETCH_ERROR') {
                setErrorMessage('Can\'t reach our servers. Check your internet connection and try again.');
            } else if (code && ERROR_MESSAGES[code]) {
                setErrorMessage(ERROR_MESSAGES[code]);
            } else if (error.status === 500) {
                setErrorMessage('Something went wrong on our end. Please try again in a moment.');
            } else {
                setErrorMessage('Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setIsResending(true);
            setErrorMessage('');
            setSuccessMessage('');
            await forgotPassword({ email }).unwrap();
            setSuccessMessage('A new code has been sent to your email.');
        } catch (error: any) {
            console.error('Resend code error:', error);
            const code = error.data?.code;
            if (code === 'TOO_MANY_ATTEMPTS') {
                setErrorMessage(ERROR_MESSAGES.TOO_MANY_ATTEMPTS);
            } else if (error.status === 'FETCH_ERROR') {
                setErrorMessage('Can\'t reach our servers. Check your internet connection and try again.');
            } else {
                setErrorMessage('Couldn\'t resend the code. Please try again.');
            }
        } finally {
            setIsResending(false);
        }
    };

    const isButtonDisabled = () =>
        otp.length !== OTP_LENGTH || password.length === 0 || confirmPassword.length === 0 || isLoading;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.flowerContainer}>
                            <FlowerBlob fill={ORANGE} width={60} height={60} />
                        </View>
                        <Text style={styles.title}>Enter Code</Text>
                        <Text style={styles.subtitle}>
                            We sent a verification code to{'\n'}
                            <Text style={styles.emailText}>{email}</Text>
                        </Text>
                    </View>

                    {/* Messages */}
                    {errorMessage && <MessageDisplay message={errorMessage} type="error" />}
                    {successMessage && <MessageDisplay message={successMessage} type="success" />}

                    {/* OTP Input */}
                    <View style={styles.formCard}>
                        <Text style={styles.inputLabel}>Verification Code</Text>
                        <View style={styles.otpRow}>
                            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (otpRefs.current[index] = ref)}
                                    style={styles.otpInput}
                                    value={otpDigits[index] || ''}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {/* Resend code */}
                        <TouchableOpacity
                            onPress={handleResendCode}
                            disabled={isResending}
                            style={styles.resendButton}
                        >
                            <Text style={styles.resendText}>
                                {isResending ? 'Sending...' : 'Resend code'}
                            </Text>
                        </TouchableOpacity>

                        {/* New Password */}
                        <Text style={styles.inputLabel}>New Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                ref={passwordRef}
                                placeholder="New password"
                                placeholderTextColor={CORNFLOWER_BLUE + '80'}
                                style={styles.passwordInput}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setErrorMessage('');
                                }}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={password}
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

                        {/* Confirm Password */}
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                placeholder="Confirm password"
                                placeholderTextColor={CORNFLOWER_BLUE + '80'}
                                style={styles.passwordInput}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setErrorMessage('');
                                }}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={confirmPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} color={CORNFLOWER_BLUE} />
                                ) : (
                                    <Eye size={20} color={CORNFLOWER_BLUE} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.buttonContainer}>
                        <EntryButton
                            title={isLoading ? 'Resetting...' : 'Reset Password'}
                            onPressQuery={handleSubmit}
                            isDisabled={isButtonDisabled()}
                            isLoading={isLoading}
                        />
                    </View>

                    {/* Back to sign in link */}
                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Remember your password? </Text>
                        <Link href="/login">
                            <Text style={styles.linkTextBold}>Sign in</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: CREAM,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: safePadding,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    flowerContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        color: CORNFLOWER_BLUE,
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: CustomFonts.ztnaturebold,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: CORNFLOWER_BLUE,
        textAlign: 'center',
        fontFamily: CustomFonts.ztnatureregular,
        opacity: 0.7,
        paddingHorizontal: 20,
    },
    emailText: {
        fontFamily: CustomFonts.ztnaturebold,
        opacity: 1,
    },
    formCard: {
        backgroundColor: PALE_BLUE,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        color: CORNFLOWER_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
        marginBottom: 8,
        marginTop: 4,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 8,
    },
    otpInput: {
        width: 44,
        height: 52,
        backgroundColor: CREAM,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 22,
        fontFamily: CustomFonts.ztnaturebold,
        color: CORNFLOWER_BLUE,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    resendButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        marginBottom: 16,
    },
    resendText: {
        fontSize: 14,
        color: ORANGE,
        fontFamily: CustomFonts.ztnaturebold,
        textDecorationLine: 'underline',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CREAM,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        marginBottom: 12,
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
    buttonContainer: {
        marginTop: 8,
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    linkText: {
        fontSize: 14,
        color: CORNFLOWER_BLUE,
        fontFamily: CustomFonts.ztnatureregular,
    },
    linkTextBold: {
        fontSize: 14,
        color: ORANGE,
        fontFamily: CustomFonts.ztnaturebold,
        textDecorationLine: 'underline',
    },
});

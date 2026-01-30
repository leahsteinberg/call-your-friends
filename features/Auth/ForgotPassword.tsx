import FlowerBlob from '@/assets/images/flower-blob.svg';
import { CustomFonts } from '@/constants/theme';
import { usePostForgotPasswordMutation } from '@/services/authApi';
import { CORNFLOWER_BLUE, CREAM, ORANGE, PALE_BLUE } from '@/styles/styles';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import EntryButton from './EntryButton';
import MessageDisplay from './MessageDisplay';

const safePadding = Platform.OS === 'ios' ? 60 : 10;

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [forgotPassword] = usePostForgotPasswordMutation();

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            setSuccessMessage('');

            await forgotPassword({ email }).unwrap();
            setSuccessMessage('If an account exists with this email, you will receive password reset instructions.');
        } catch (error: any) {
            console.error("Forgot password error:", error);

            if (error.status === 'FETCH_ERROR') {
                setErrorMessage("Network error. Please check your connection and try again.");
            } else {
                // Don't reveal if email exists or not for security
                setSuccessMessage('If an account exists with this email, you will receive password reset instructions.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = () => email.length === 0 || isLoading;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.flowerContainer}>
                            <FlowerBlob fill={ORANGE} width={60} height={60} />
                        </View>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>
                    </View>

                    {/* Error message display */}
                    {errorMessage && (
                        <MessageDisplay message={errorMessage} type="error" />
                    )}

                    {/* Success message display */}
                    {successMessage && (
                        <MessageDisplay message={successMessage} type="success" />
                    )}

                    {/* Input form card */}
                    <View style={styles.formCard}>
                        <TextInput
                            placeholder="Email address"
                            placeholderTextColor={CORNFLOWER_BLUE + '80'}
                            style={styles.textInput}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrorMessage('');
                                setSuccessMessage('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                        />
                    </View>

                    {/* Button container */}
                    <View style={styles.buttonContainer}>
                        <EntryButton
                            title={isLoading ? "Sending..." : "Send Reset Link"}
                            onPressQuery={handleSubmit}
                            isDisabled={isButtonDisabled()}
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
    formCard: {
        backgroundColor: PALE_BLUE,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
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

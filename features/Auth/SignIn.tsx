import FlowerBlob from '@/assets/images/flower-blob.svg';
import { CustomFonts } from '@/constants/theme';
import { usePostSignInMutation } from '@/services/authApi';
import { CORNFLOWER_BLUE, CREAM, ORANGE, PALE_BLUE } from '@/styles/styles';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';
import EntryButton from './EntryButton';
import MessageDisplay from './MessageDisplay';
import UserEmailPasswordInput from './UserEmailPasswordInput';

const safePadding = Platform.OS === 'ios' ? 60 : 10;


export function SignIn()  {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [signInUser] = usePostSignInMutation();

    const handleAuthQuery = async (e: any, authQuery: any) => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            const result = await authQuery({email, password}).unwrap();
            if (result) {
                dispatch(setLogInCredentials({ token: result.token, user: result.user }))
            } else {
                setErrorMessage("Unable to sign in. Please try again.");
            }
        } catch (error: any) {
            console.error("Sign in error:", error);

            if (error.status === 401) {
                setErrorMessage("Incorrect email or password. Double-check and try again.");
            } else if (error.status === 404) {
                setErrorMessage("We couldn't find an account with that email. Want to sign up instead?");
            } else if (error.status === 429) {
                setErrorMessage("Too many sign-in attempts. Please wait a minute and try again.");
            } else if (error.status === 'FETCH_ERROR') {
                setErrorMessage("Can't reach our servers. Check your internet connection and try again.");
            } else if (error.status === 500) {
                setErrorMessage("Something went wrong on our end. Please try again in a moment.");
            } else {
                setErrorMessage(error.data?.message || "Sign in failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }
    const isSigninButtonDisabled = () => !(email.length > 0 && password.length > 0) || isLoading;

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
                    {/* Header with bird decoration */}
                    <View style={styles.header}>
                    <View style={styles.flowerContainer}>
                            <FlowerBlob fill={ORANGE} width={60} height={60} />
                        </View>
                        <Text style={styles.title}>Call Your Friends</Text>
                        <Text style={styles.subtitle}>Sign in to connect</Text>
                    </View>

                    {/* Error message display */}
                    {errorMessage && (
                        <MessageDisplay message={errorMessage} type="error" />
                    )}

                    {/* Input form card */}
                    <View style={styles.formCard}>
                        <UserEmailPasswordInput
                            onChangeEmail={(text: string) => {
                                setEmail(text);
                                setErrorMessage('');
                            }}
                            onChangePassword={(text: string) => {
                                setPassword(text);
                                setErrorMessage('');
                            }}
                        />
                    </View>

                    {/* Forgot password link */}
                    <View style={styles.forgotPasswordContainer}>
                        <Link href="/forgot-password">
                            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                        </Link>
                    </View>

                    {/* Button container */}
                    <View style={styles.buttonContainer}>
                        <EntryButton
                            title={isLoading ? "Signing in..." : "Sign In"}
                            onPressQuery={(e: any) => handleAuthQuery(e, signInUser)}
                            isDisabled={isSigninButtonDisabled()}
                            isLoading={isLoading}
                        />
                    </View>

                    {/* Sign up link */}
                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Don't have an account? </Text>
                        <Link href="/signup" style={styles.link}>
                            <Text style={styles.linkTextBold}>Sign up</Text>
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
    },
    formCard: {
        backgroundColor: PALE_BLUE,
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: CORNFLOWER_BLUE,
        fontFamily: CustomFonts.ztnatureregular,
        textDecorationLine: 'underline',
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
    link: {
        // Link component doesn't need additional styling
    },
    linkTextBold: {
        fontSize: 14,
        color: ORANGE,
        fontFamily: CustomFonts.ztnaturebold,
        textDecorationLine: 'underline',
    },
});

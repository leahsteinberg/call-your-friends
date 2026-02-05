import FlowerBlob from '@/assets/images/flower-blob.svg';
import { CustomFonts } from '@/constants/theme';
import { usePostPhoneSignupMutation } from '@/services/authApi';
import { CORNFLOWER_BLUE, CREAM, ORANGE, PALE_BLUE } from '@/styles/styles';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';
import EntryButton from './EntryButton';
import MessageDisplay from './MessageDisplay';
import UserDataInput from './UserDataInput';
import UserEmailPasswordInput from './UserEmailPasswordInput';

const safePadding = Platform.OS === 'ios' ? 60 : 10;

export function SignUp()  {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const dispatch = useDispatch();
    const [phoneSignUpUser] = usePostPhoneSignupMutation();

    const handleAuthQuery = async (e: any, authQuery: any) => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            const result = await authQuery({email, password, phoneNumber, name}).unwrap();
            if (result) {
                dispatch(setLogInCredentials({ token: result.token, user: result.user }))
            } else {
                setErrorMessage("Unable to create account. Please try again.");
            }
        } catch (error: any) {
            console.error("Sign up error:", error);

            // Provide user-friendly error messages
            if (error.status === 409) {
                setErrorMessage("An account with this email already exists. Please sign in instead.");
            } else if (error.status === 400) {
                setErrorMessage(error.data?.message || "Invalid information provided. Please check your details.");
            } else if (error.status === 'FETCH_ERROR') {
                setErrorMessage("Network error. Please check your connection and try again.");
            } else {
                setErrorMessage(error.data?.message || "Sign up failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const isSignupButtonDisabled = () => !(
        email.length > 0
        && password.length > 0
        && isPasswordValid
        && name.length > 0
        && phoneNumber.length === 10
    ) || isLoading;
    

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
                    {/* Header with flower decoration */}
                    <View style={styles.header}>
                        <View style={styles.flowerContainer}>
                            <FlowerBlob fill={ORANGE} width={60} height={60} />
                        </View>
                        <Text style={styles.title}>Loyal</Text>
                        <Text style={styles.subtitle}>Create your account</Text>
                    </View>

                    {/* Error message display */}
                    {errorMessage && (
                        <MessageDisplay message={errorMessage} type="error" />
                    )}

                    {/* Input form card */}
                    <View style={styles.formCard}>
                        <UserDataInput
                            onChangeName={(text: string) => {
                                setName(text);
                                setErrorMessage('');
                            }}
                            onChangePhoneNumber={(phone: string) => {
                                setPhoneNumber(phone);
                                setErrorMessage('');
                            }}
                            phoneNumber={phoneNumber}
                            showName={true}
                            showPhoneNumber={true}
                        />
                        <UserEmailPasswordInput
                            onChangeEmail={(text: string) => {
                                setEmail(text);
                                setErrorMessage('');
                            }}
                            onChangePassword={(text: string) => {
                                setPassword(text);
                                setErrorMessage('');
                            }}
                            validatePassword={true}
                            onPasswordValidityChange={setIsPasswordValid}
                        />
                    </View>

                    {/* Button container */}
                    <View style={styles.buttonContainer}>
                        <EntryButton
                            title={isLoading ? "Creating account..." : "Sign Up"}
                            onPressQuery={(e: any) => handleAuthQuery(e, phoneSignUpUser)}
                            isDisabled={isSignupButtonDisabled()}
                        />
                    </View>

                    {/* Sign in link */}
                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Already have an account? </Text>
                        <Link href="/login" style={styles.link}>
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
    },
    formCard: {
        backgroundColor: PALE_BLUE,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
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

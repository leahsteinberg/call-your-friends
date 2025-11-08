import { usePostSignInMutation } from '@/services/authApi';
import { BURGUNDY, CREAM } from '@/styles/styles';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';
import EntryButton from './EntryButton';
import UserEmailPasswordInput from './UserEmailPasswordInput';

export function SignIn()  {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const [signInUser] = usePostSignInMutation();
    
    const handleAuthQuery = async (e: any, authQuery: any) => {
        const result = await authQuery({email, password}).unwrap();
        if (result) {
            dispatch(setLogInCredentials({ token: result.token, user: result.user }))
        } else {
            console.log("error logging in / signing in")
        }
    }
    const isSigninButtonDisabled = () => !(email.length > 0 && password.length > 0);

    return (
        <View style={[styles.container,]}>
            <Text style={[styles.title]}>
                Call Your Friends
            </Text>
            
            <View style={styles.component}>
                <UserEmailPasswordInput
                    onChangeEmail={(text: string)=> setEmail(text)}
                    onChangePassword={(text: string) => setPassword(text)}
                />
            </View>
            <View style={[styles.component,{paddingBottom: 60}]}>
                <EntryButton
                    title="Sign In"
                    onPressQuery={(e: any) => handleAuthQuery(e, signInUser)}
                    isDisabled={isSigninButtonDisabled()}
                />
                {/* TO DO: link to sign up page! */}
            </View>
    </View>
    );
}


 const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        minWidth: 300,

        maxHeight: '100%',
        maxWidth: '100%',
        width: '100%',
        
        justifyContent: 'space-between',
        overflow: 'scroll',
        flex: 1,
    },
    wrapper: {
        justifyContent: 'center',
        backgroundColor: CREAM,
        minHeight: 500,
    },
    title: {
        fontSize: 40,
        color: BURGUNDY,
        textAlign: 'center',
        margin: 20,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' : undefined,
    },
    component: {
        margin: 20,
    }
});

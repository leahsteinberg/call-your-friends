import { usePostPhoneSignupMutation, usePostSignInMutation } from '@/services/authApi';
import { BURGUNDY } from '@/styles/styles';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';
import EntryButton from './EntryButton';
import PhoneNumberInput from './PhoneNumberInput';
import UserDataInput from './UserDataInput';

export function AuthComponent()  {

    const {height, width} = useWindowDimensions();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const dispatch = useDispatch();
    const [phoneSignUpUser, phoneSignUpStatus] = usePostPhoneSignupMutation();
    const [signInUser] = usePostSignInMutation();
    
    const handleAuthQuery = async (e: any, authQuery: any) => {
        const result = await authQuery({email, password, phoneNumber, name}).unwrap();
        if (result) {
            dispatch(setLogInCredentials({ token: result.token, user: result.user }))
        } else {
            console.log("error logging in / signing in")
        }
    }

    return (

        <TouchableWithoutFeedback
            style={[styles.container,]}
        >
            <View style={[styles.wrapper, {height: height*.7, width: width*.9} ]}>
            <Text style={[styles.title]}>
                Call Your Friends
            </Text>
            <View style={styles.component}>
                <PhoneNumberInput
                    onDataChange={setPhoneNumber}
                    phoneNumber={phoneNumber}
                />
                <UserDataInput
                    onChangeEmail={(text: string)=> setEmail(text)}
                    onChangePassword={(text: string) => setPassword(text)}
                    onChangeName={(text: string) => setName(text)}
                    showName={true}
                    //TO DO - deal with showing name - sign IN vs sign Up                  
                />
            </View>

            <View 
                style={styles.component}
            >
                <EntryButton
                    title="Sign In"
                    onPressQuery={(e: any) => handleAuthQuery(e, signInUser)}
                />
                <EntryButton
                    title="Sign Up"
                    onPressQuery={phoneSignUpUser}
                />
            </View>
            </View>
</TouchableWithoutFeedback>);
}


 const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'purple',
    },
    wrapper: {
        justifyContent: 'center',
        backgroundColor: 'yellow',
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

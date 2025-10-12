import { usePostPhoneSignupMutation, usePostSignInMutation } from '@/services/authApi';
import { LIGHT_GREEN } from '@/styles/styles';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';
import EntryButton from './EntryButton';
import PhoneNumberInput from './PhoneNumberInput';
import UserDataInput from './UserDataInput';

export function AuthComponent()  {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const dispatch = useDispatch();
    const [phoneSignUpUser, phoneSignUpStatus] = usePostPhoneSignupMutation();
    const [signInUser] = usePostSignInMutation();
    
    const handleAuthQuery = async (e, authQuery) => {
        const result = await authQuery({email, password, phoneNumber, name}).unwrap();
        if (result) {
            dispatch(setLogInCredentials({ token: result.token, user: result.user }))
        } else {
            console.log("error logging in/ signing in")
        }
    }

    return (
        <View style={styles.container}>
            <Text style={{fontFamily: 'Catamaran', fontSize: 30}}>
                Call Your Friends
            </Text>
            <PhoneNumberInput
                onDataChange={setPhoneNumber}
                phoneNumber={phoneNumber}
            />
            <UserDataInput
                onChangeEmail={(text)=> setEmail(text)}
                onChangePassword={(text) => setPassword(text)}
                onChangeName={(text) => setName(text)}
                //TO DO - deal with showing name - sign IN vs sign UP
            />
            <View>
                <EntryButton
                    title="Sign In"
                    onPressQuery={(e) => handleAuthQuery(e, signInUser)}
                />
                <EntryButton
                    title="Sign Up"
                    onPressQuery={phoneSignUpUser}
                />
            </View>
        </View>);
}


 const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: LIGHT_GREEN,
    },
    component: {
        padding: 40,
        backgroundColor: '#5d6532',
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    textInput: {
        borderRadius: 3,
    },
});

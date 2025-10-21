import { usePostPhoneSignupMutation, usePostSignInMutation } from '@/services/authApi';
import { BURGUNDY } from '@/styles/styles';
import { useState } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
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
    
    const handleAuthQuery = async (e, authQuery) => {
        const result = await authQuery({email, password, phoneNumber, name}).unwrap();
        if (result) {
            dispatch(setLogInCredentials({ token: result.token, user: result.user }))
        } else {
            console.log("error logging in/ signing in")
        }
    }

    return (

        <TouchableWithoutFeedback
            style={[styles.container,]}
        >
            <View style={[styles.wrapper, {height: height*.7, width: width*.9} ]}>
            <Text style={[{fontSize: 40, color: BURGUNDY, textAlign: 'center'}, styles.component]}>
                Call Your Friends
            </Text>
            <View style={styles.component}>
                <PhoneNumberInput
                    onDataChange={setPhoneNumber}
                    phoneNumber={phoneNumber}
                />
                <UserDataInput
                    onChangeEmail={(text)=> setEmail(text)}
                    onChangePassword={(text) => setPassword(text)}
                    onChangeName={(text) => setName(text)}
                    //TO DO - deal with showing name - sign IN vs sign Up                  
                />
            </View>

            <View 
                style={styles.component}
            >
                <EntryButton
                    title="Sign In"
                    onPressQuery={(e) => handleAuthQuery(e, signInUser)}
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
    component: {
        margin: 20,
    }
});

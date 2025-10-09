import { usePostPhoneSignupMutation, usePostSignInMutation } from '@/services/authApi';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { HOST_WITH_PORT } from '../../environment';
import { setLogInCredentials } from './authSlice';
import EmailAndPassword from './EmailAndPassword';
import PhoneNumberInput from './PhoneNumberInput';
import PhoneNumberValidity from './PhoneNumberValidity';



export function AuthComponent()  {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const dispatch = useDispatch();
    const [phoneSignUpUser, phoneSignUpStatus] = usePostPhoneSignupMutation();
    const [signInUser] = usePostSignInMutation();
    
    const handleAuthQuery = async (e, authQuery) => {
        const result = await authQuery({email, password, phoneNumber}).unwrap();
        dispatch(setLogInCredentials({ token: result.token, user: result.user }))
    }

    return (
        <View style={styles.container}>
            <Text>
                {HOST_WITH_PORT}
            </Text>
            <PhoneNumberValidity phoneNumber={phoneNumber}/>
            <PhoneNumberInput onDataChange={setPhoneNumber}/>
            <EmailAndPassword
                onDataChangeEmail={(text)=> setEmail(text)}
                onDataChangePassword={(text) => setPassword(text)}
            />
            <View>
            <View
            style={styles.buttonContainer}
            >
            <TouchableOpacity
                onPress={(e)=> handleAuthQuery(e, signInUser)}
                style={styles.button}
                //disabled={!isPhoneNumberValid}
            >
            <Text style={styles.text}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={(e) => handleAuthQuery(e, phoneSignUpUser)}
                style={styles.button}
                //disabled={!isPhoneNumberValid}
            >
                <Text style={styles.text}>Sign Up</Text>
            </TouchableOpacity>
            </View>
            </View>
        </View>);

}


 const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D1D6BD',
    },
    component: {
        padding: 40,
        backgroundColor: '#5d6532',
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    textInput: {
        borderRadius: '18',
    },
    button: {
        backgroundColor: '#8fa4d1',
        paddingTop: '15px',
        paddingBottom: '15px',
        paddingLeft: '10px',
        paddingRight: '10px',
        margin: '10px',
    },
    text: {
        color: 'white',
    },
    buttonContainer: {

    },

});

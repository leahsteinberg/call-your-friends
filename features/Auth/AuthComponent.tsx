import { usePostPhoneSignupMutation, usePostSignInMutation } from '@/services/authApi';
import { LIGHT_GREEN } from '@/styles/styles';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';
import PhoneNumberInput from './PhoneNumberInput';
import PhoneNumberValidity from './PhoneNumberValidity';
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
        console.log("handle auth query ", result)
        if (result) {
            dispatch(setLogInCredentials({ token: result.token, user: result.user }))
        }
    }

    return (
        <View style={styles.container}>
            <Text style={{fontFamily: 'Catamaran', fontSize: 30}}>
                Call Your Friends
            </Text>
            <PhoneNumberValidity phoneNumber={phoneNumber}/>
            <PhoneNumberInput onDataChange={setPhoneNumber}/>
            <UserDataInput
                onDataChangeEmail={(text)=> setEmail(text)}
                onDataChangePassword={(text) => setPassword(text)}
                onDataChangeName={(text) => setName(text)}
                //TO DO - deal with showing name - sign IN vs sign UP
            />
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
        </View>);
}


 const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: LIGHT_GREEN,
    },
    title: {

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

import { usePostPhoneSignupMutation, usePostSignInMutation } from '@/services/authApi';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';
import PhoneNumberInput from './PhoneNumberInput';


export function AuthComponent()  {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false)
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [phoneSignUpUser, phoneSignUpStatus] = usePostPhoneSignupMutation();
    const [signInUser] = usePostSignInMutation();

    const handleAuthQuery = async (e, authQuery) => {
        const result = await authQuery({email, password, phoneNumber}).unwrap();
        dispatch(setLogInCredentials({ token: result.token, user: result.user }))
    }

    const renderPhoneNumberValid = () => {
        setIsPhoneNumberValid(true);
        return (<Text style={{backgroundColor: 'green'}}>Phone Number IS valid</Text>);
    }
    const renderPhoneNumberInvalid = () =>  {
        setIsPhoneNumberValid(false);
        return (<Text style={{backgroundColor: 'red'}}>Phone Number is NOT valid</Text>);
    }
    const renderPhoneNumberValidity = () => {
        if (phoneNumber.length>0) {
        const number = Number(phoneNumber)
        if (number && phoneNumber.length === 10
            && Number.isInteger(number) && number >= 0
        ) {
            return renderPhoneNumberValid();
        }
        return renderPhoneNumberInvalid();
        }
    }

    return (
        <View style={styles.container}>
            <Text>
                This is the Sign In Page
            </Text>
            {renderPhoneNumberValidity()}
            <TextInput
                placeholder="Email address"
                style={styles.textInput}
                onChangeText={(text)=> setEmail(text)}
            />
            <PhoneNumberInput onDataChange={setPhoneNumber}/>
            <TextInput
                placeholder="Password"
                style={styles.textInput}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
            />
            <View>
            <View
            style={styles.buttonContainer}
            >
            <TouchableOpacity
                onPress={(e)=> handleAuthQuery(e, signInUser)}
                style={styles.button}
                // disabled={!isPhoneNumberValid}
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
    backgroundColor: '#74342B',
  },
component: {
    padding: 40,
    backgroundColor: 'lightblue',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  textInput: {
    borderRadius: '18',
},
    button: {
        backgroundColor: '#8fa4d1',

    },
    text: {
        color: 'white',
    },
    buttonContainer: {

    },

});

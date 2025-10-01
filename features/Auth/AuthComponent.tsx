import { usePostPhoneSignupMutation, usePostSignInMutation, usePostSignupMutation } from '@/services/authApi';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';


export function AuthComponent()  {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false)
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [signUpUser, {isLoading, isSuccess, isError, error}] = usePostSignupMutation();
    const [phoneSignUpUser, phoneSignUpStatus] = usePostPhoneSignupMutation();

    const [signInUser] = usePostSignInMutation();

    const handleSignIn = async (e, {email, password}) => {
        const result = await signInUser({email, password}).unwrap();
        dispatch(setLogInCredentials({ token: result.token, user: result.user }))
    }

    const handleSignUp = async (e, {email, password}) => {
        const result = await signUpUser({email, password}).unwrap();
        dispatch(setLogInCredentials({ token: result.token, user: result.user }))
    }

    const handlePhoneSignUp = async (e) => {
        const result = await phoneSignUpUser({email, password, phoneNumber}).unwrap();
        dispatch(setLogInCredentials({ token: result.token, user: result.user }))
    }

    const renderPhoneNumberValid = () => {
        return (<Text>Phone Number IS valid</Text>);
    }
        const renderPhoneNumberInvalid = () =>  {
        return (<Text>Phone Number is NOT valid</Text>);
    }
    const renderPhoneNumberValidity = () => {
        if (phoneNumber.length>0) {
        const number = Number(phoneNumber)
        if (
            number
            && phoneNumber.length === 10
            && Number.isInteger(number)
            && number >= 0
        ) {
            setIsPhoneNumberValid(true);
            return renderPhoneNumberValid();
        }
        setIsPhoneNumberValid(false);
        return renderPhoneNumberInvalid();
        }
    }

    if (isLoading) return <View>Is Loading</View>;
    if (error) return <View>Error found</View>

    return (
        <View>
         <View/>
            <Text>
                This is the Sign In Page
            </Text>
            {renderPhoneNumberValidity()}
            <TextInput
                placeholder="Email address"
                style={styles.textInput}
                onChangeText={(text)=> setEmail(text)}
                />
            <TextInput
                placeholder="Phone Number"
                style={styles.textInput}
                onChangeText={(text)=> setPhoneNumber(text)}
            />
            <TextInput
                placeholder="Password"
                style={styles.textInput}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
                
            />
            <Button
                title="Sign In"
                onPress={(e)=> {handleSignIn(e, {email, password})}}
                disabled={!isPhoneNumberValid}
            />
            {/* <Button
                title="Sign Up (email)"
                onPress={(e)=> {handleSignUp(e, {email, password})}}
            /> */}
            <Button
                title="Sign Up (with Phone)"
                onPress={(e)=> {handlePhoneSignUp(e, {email, password})}}
                disabled={!isPhoneNumberValid}

            />

            {/* <Button
                title="Sign In With Phone Number"
                onPress={(e)=> {handlePNSignIn(e, {email, phoneNumber, password})}}
            />
            <Button
                title="Sign Up With Phone Number"
                onPress={(e)=> {handlePNSignIn(e, {email, phoneNumber, password})}}
            /> */}
        </View>);

}

const styles = StyleSheet.create({
    textInput:{
        borderRadius: '18',
    }
});

import { usePostSignInMutation, usePostSignupMutation } from '@/services/authApi';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';

export function AuthComponent()  {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [signupUser, {isLoading, isSuccess, isError, error}] = usePostSignupMutation();
    const [signInUser] = usePostSignInMutation();
    
    const handleSignIn = async (e, {email, password}) => {
        const result = await signInUser({email, password}).unwrap();
        dispatch(setLogInCredentials({ token: result.token, user: result.user }))
    }

    if (isLoading) return <View>Is Loading</View>;
    if (error) return <View>Error found</View>

    return (
        <View>
         <View/>
            <Text>
                Hi there - this is the signin Page
            </Text>
            <TextInput
                placeholder="Email address"
                style={styles.textInput}
                onChangeText={(text)=> setEmail(text)}
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
            />
        </View>);

}

const styles = StyleSheet.create({
    textInput:{
        border: '5px solid red'
    }
});

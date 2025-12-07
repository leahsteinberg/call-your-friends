import { CustomFonts } from '@/constants/theme';
import { useAcceptInviteSignInMutation, useAcceptInviteSignUpMutation, useUserByPhoneMutation } from '@/services/contactsApi';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from '../Auth/authSlice';
import EntryButton from '../Auth/EntryButton';
import PhoneNumberInput from '../Auth/PhoneNumberInput';
import UserDataInput from '../Auth/UserDataInput';
import UserEmailPasswordInput from '../Auth/UserEmailPasswordInput';

export default function InviteAccept() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(userToPhoneNumber || '');
    const dispatch = useDispatch();


    const params = useLocalSearchParams();
    const {token, userToPhoneNumber} = params;
    console.log({token, userToPhoneNumber});


    const [userToExists, setUserToExists] = useState(false);
    const [findUserByPhone] = useUserByPhoneMutation();
    const [acceptInviteNewUser] = useAcceptInviteSignUpMutation();
    const [acceptInviteExistingUser] = useAcceptInviteSignInMutation();

    useEffect(()=> {
        (async () => {
            if (userToPhoneNumber) {
                const user = await findUserByPhone({userPhoneNumber: userToPhoneNumber}).unwrap();
                console.log("Is there a user???", !!user, user);
                setUserToExists(!!user);
            }
        })();
    }, [])

    const handleAcceptInvite = async () => {
        let result;
        if (userToExists) {
            result = await acceptInviteExistingUser({token, email, phoneNumber, password})
        } else {
            result = await acceptInviteNewUser({token, email, phoneNumber, name, password});
            console.log("result from accept new user", result);
        }
        if (result) {
            dispatch(setLogInCredentials({ token: result.data.token, user: result.data.user }))
            //TODO - figure out why I have to do result.data here but just result
            // in the regular sign up page...?
        }
    }


    const authButtonSignIn = () => {
        return (
            <EntryButton
                title="Sign In & Accept Friend"
                onPressQuery={handleAcceptInvite}
                isDisabled={false}
            />
        );
    };

    const authButtonSignUp = () => {
        return (
            <EntryButton
                title="Sign Up & Accept Friend"
                onPressQuery={handleAcceptInvite}
                isDisabled={false}
            />)
    }


    if (!userToExists) {
        return (
            <View style={styles.container}>
                <Text style={{fontFamily: CustomFonts.ztnaturebold, fontSize: 30}}>
                    Call Your Friends - make a new account
                </Text>
                <PhoneNumberInput
                    onDataChange={setPhoneNumber}
                    phoneNumber={phoneNumber}
                />
                <UserDataInput
                    onChangeEmail={(text)=> setEmail(text)}
                    onChangePassword={(text) => setPassword(text)}
                    onChangeName={(text) => setName(text)}
                    showName={!userToExists}
                    
                />
                <UserEmailPasswordInput
                    onChangeEmail={(text: string)=> setEmail(text)}
                    onChangePassword={(text: string) => setPassword(text)}
                />
                {authButtonSignUp()}
            </View>        
        );

        
    }
    
    return (
        <View style={styles.container}>
            <Text style={{fontFamily: CustomFonts.ztnaturebold, fontSize: 30}}>
                Call Your Friends.
            </Text>
            <PhoneNumberInput
                onDataChange={setPhoneNumber}
                phoneNumber={phoneNumber}
            />
            <UserDataInput
                onChangeEmail={(text)=> setEmail(text)}
                onChangePassword={(text) => setPassword(text)}
                onChangeName={(text) => setName(text)}
                showName={!userToExists}
                
            />
            {authButtonSignIn()}
        </View>        
    );
}

 const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D1D6BD',
    },
});

    // TO DO - render page with "You have been invited to Join
    // call your friends by - (name of friend)."
    // Join with this NUMBER (your number) and become friends with
    // NAME OF FRIEND??// need from network call.
  

    // LATER - in the "contacts" page - need to persist the
    // friends (including pending) and render friends and invites on 
    // upon log in.
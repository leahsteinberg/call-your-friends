import { useAcceptInviteSignInMutation, useAcceptInviteSignUpMutation, useUserByPhoneMutation } from '@/services/contactsApi';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from '../Auth/authSlice';
import EntryButton from '../Auth/EntryButton';
import PhoneNumberInput from '../Auth/PhoneNumberInput';
import UserDataInput from '../Auth/UserDataInput';

export default function InviteAccept() {
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const {token, userToPhoneNumber} = params;
    console.log({token, userToPhoneNumber});
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(userToPhoneNumber || '');
    const [userToExists, setUserToExists] = useState(false);
    const [findUserByPhone] = useUserByPhoneMutation();
    const [acceptInviteNewUser] = useAcceptInviteSignUpMutation();
    const [acceptInviteExistingUser] = useAcceptInviteSignInMutation();

    useEffect(()=> {
        (async () => {
            if (userToPhoneNumber) {
                const user = await findUserByPhone({userPhoneNumber: userToPhoneNumber}).unwrap();
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

    const userAuthButton = () => {
        return (userToExists ?
            <EntryButton
                title="Sign In & Accept Friend"
                onPressQuery={handleAcceptInvite}
            />
            :
            <EntryButton
                title="Sign Up & Accept Friend"
                onPressQuery={handleAcceptInvite}
            />
        );


        // renderUserAuthButton("Sign In & Accept Friend")
        // : renderUserAuthButton("Sign Up & Accept Friend")
    }
    
    return (
        <View style={styles.container}>
            <Text style={{fontFamily: 'Catamaran', fontSize: 30}}>
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
            {userAuthButton()}
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
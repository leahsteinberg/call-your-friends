import { useAcceptInviteMutation, useUserByPhoneMutation } from '@/services/contactsApi';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import PhoneNumberInput from '../Auth/PhoneNumberInput';
import PhoneNumberValidity from '../Auth/PhoneNumberValidity';
import UserDataInput from '../Auth/UserDataInput';
import { setLogInCredentials } from '../Auth/authSlice';

export default function InviteAccept() {
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const {token, userToPhoneNumber} = params;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(userToPhoneNumber || '');
    const [userToExists, setUserToExists] = useState(false);
    const [findUserByPhone] = useUserByPhoneMutation();
    const [acceptInvite] = useAcceptInviteMutation();

    useEffect(()=> {
        (async () => {
            if (userToPhoneNumber) {
                const user = await findUserByPhone({userPhoneNumber: userToPhoneNumber}).unwrap();
                console.log("user is ---", user);
                setUserToExists(!!user);
            }
        }
        )();
    }, [])
        // do a "get Invite" network call in order to show who sent you the invite?

    const acceptInviteNewUser = async () => {
        console.log("pressed accept invite new user")
        const result = await acceptInvite({token, email, phoneNumber, name, password});
        //TODO more robust error handling
        console.log("result from accept new user", result);
        if (result) {
            dispatch(setLogInCredentials({ token: result.data.token, user: result.data.user }))
            //TODO - figure out why I have to do result.data here but just result
            // in the regular sign up page...?

        }
        
    }
    const renderUserAuthButton = (text, authQuery) => {
        console.log("authquery", authQuery)
        return (
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={(e) => {authQuery()}}
                    style={styles.button}
                    //disabled={!isPhoneNumberValid}
                >
                    <Text style={styles.text}>{text}</Text>
                </TouchableOpacity>
            </View>
            );
    }

    const userAuthButton = () => {
        return userToExists ?
        renderUserAuthButton("Sign In & Accept Friend", () => {})
        : renderUserAuthButton("Sign Up & Accept Friend", acceptInviteNewUser)
    }
    
    return (
        <View style={styles.container}>
            <Text>
                This is the Invite Accept Component.
                You have been invited to Call Your Friends.
                Is this the number you would like to use? {userToPhoneNumber}
                user Exists? {String(userToExists)}
            </Text>
            <PhoneNumberValidity phoneNumber={phoneNumber}/>
            <PhoneNumberInput
                onDataChange={setPhoneNumber}
                phoneNumber={phoneNumber}
            />
            <UserDataInput
                onDataChangeEmail={(text)=> setEmail(text)}
                onDataChangePassword={(text) => setPassword(text)}
                onDataChangeName={(text) => setName(text)}
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

    // TO DO - render page with "You have been invited to Join
    // call your friends by - (name of friend)."
    // Join with this NUMBER (your number) and become friends with
    // NAME OF FRIEND??// need from network call.
    // display the phone number.
    // input for email
    // input for password.
    // when press accept, should hit the "accept invite" endpoint.

    // after, to build - what if this user is already a member? (this logic may happen 
    //higher up, and then decide which page to load.. probably a different version
    // of the login page, but then need add friend and accept invite.)
    // maybe need a "create user and accept friendship" -- need to break down the logic
    // on the backend.

    // LATER - in the "contacts" page - need to persist the
    // friends (including pending) and render friends and invites on 
    // upon log in.
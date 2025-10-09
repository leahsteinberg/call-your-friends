import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HOST_WITH_PORT } from '../../environment';
import EmailAndPassword from '../Auth/EmailAndPassword';
import PhoneNumberInput from '../Auth/PhoneNumberInput';
import PhoneNumberValidity from '../Auth/PhoneNumberValidity';


export default function InviteAccept() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    let params = useLocalSearchParams();// TODO - change to const
    console.log("actual search params:", params);
    const {token, userToPhoneNumber} = params;

    useEffect(()=> {
        // do a "get Invite" network Call in order to show who sent you the invite?
        // also to figure out if this user already exists or not
        // right now the code assumes the user does NOT.  
    }, [])


    return (
        <View style={styles.container}>
            <Text>
                This is the Invite Accept Component
                You have been invited to Call Your Friends
                Is this the number you would like to use? {userToPhoneNumber}
                {HOST_WITH_PORT}
            </Text>
            <PhoneNumberValidity phoneNumber={phoneNumber}/>
            <PhoneNumberInput onDataChange={setPhoneNumber}/>
            <EmailAndPassword
                onDataChangeEmail={(text)=> setEmail(text)}
                onDataChangePassword={(text) => setPassword(text)}
            />
            <View
                style={styles.buttonContainer}
            >
            <TouchableOpacity
                onPress={(e) => {}}
                style={styles.button}
                //disabled={!isPhoneNumberValid}
            >
                <Text style={styles.text}>Sign Up & Accept Friend</Text>
            </TouchableOpacity>
            </View>
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
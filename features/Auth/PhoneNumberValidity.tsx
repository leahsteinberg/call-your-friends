import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { phoneNumberIsValid } from '../Contacts/contactsUtils';



export default function PhoneNumberValidity({phoneNumber}) {
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false)
    

    const renderPhoneNumberValidity = () => {
        if (phoneNumber.length>0) {
            if (phoneNumberIsValid(phoneNumber)) {
                return renderPhoneNumberValid();
            }
            return renderPhoneNumberInvalid();
        }
    }
    
    const renderPhoneNumberValid = () => {
        setIsPhoneNumberValid(true);
        return (<Text style={{backgroundColor: 'green'}}>Phone Number IS valid</Text>);
    }
    const renderPhoneNumberInvalid = () =>  {
        setIsPhoneNumberValid(false);
        return (<Text style={{backgroundColor: 'red'}}>Phone Number is NOT valid</Text>);
    }
    

    return (
        <View style={styles.container}>
            {renderPhoneNumberValidity()}
        </View>
    );
}


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
    component: {
    padding: 10,
    backgroundColor: 'lightblue',
    alignSelf: 'stretch',
    alignItems: 'center',
            borderRadius: 3,

  },
    textInput:{
        borderRadius: '18',
    },
});
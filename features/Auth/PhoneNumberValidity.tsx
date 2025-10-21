import { Check, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { phoneNumberIsValid } from '../Contacts/contactsUtils';


export default function PhoneNumberValidity({phoneNumber}) {
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false)
    const iconSize = 24;

    const renderPhoneNumberValidity = () => {
        if (phoneNumber.length>0) {
            if (phoneNumberIsValid(phoneNumber)) {
                return renderPhoneNumberValid();
            }
            return renderPhoneNumberInvalid();
        }
        return <View style={{height: iconSize, width: iconSize}}></View>
    }
    
    const renderPhoneNumberValid = () => {
        setIsPhoneNumberValid(true);
        return (<Check color="green" size={iconSize} />);
    }
    const renderPhoneNumberInvalid = () =>  {
        setIsPhoneNumberValid(false);
        return (<X color="red" size={iconSize} />);
    }
    

    return (
        <View >
            {renderPhoneNumberValidity()}
        </View>
    );
}

import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import { View } from 'react-native';
import { isPhoneNumberValid } from '../Contacts/contactsUtils';


export default function PhoneNumberValidity({phoneNumber}) {
    const [phoneNumberValid, setIsPhoneNumberValid] = useState(false)
    const iconSize = 24;

    const renderPhoneNumberValidity = () => {
        if (phoneNumber.length>0) {
            if (isPhoneNumberValid(phoneNumber)) {
                return renderPhoneNumberValid();
            }
            return renderPhoneNumberInvalid();
        }
        return <View style={{height: iconSize, width: iconSize}}></View>
    }
    
    const renderPhoneNumberValid = () => {
        setIsPhoneNumberValid(true);
        return (<IconSymbol name="checkmark" color="green" size={iconSize} />);
    }
    const renderPhoneNumberInvalid = () =>  {
        setIsPhoneNumberValid(false);
        return (<IconSymbol name="xmark" color="red" size={iconSize} />);
    }
    

    return (
        <View >
            {renderPhoneNumberValidity()}
        </View>
    );
}

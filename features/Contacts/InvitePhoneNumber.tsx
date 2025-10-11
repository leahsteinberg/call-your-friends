import { useCreateInviteMutation } from "@/services/contactsApi";
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from "react-redux";
import PhoneNumberValidity from '../Auth/PhoneNumberValidity';

export default function PhoneNumberInput() {
    const [userToPhoneNumber, setPhoneNumber] = useState('');
    const userFromId = useSelector((state) => state.auth.user.id);
    const [usePostCreateInvite] = useCreateInviteMutation();
    
    const sendInviteToPhoneNumber = async () => {
        const response = await usePostCreateInvite({userFromId, userToPhoneNumber})
        if (response) {
            setPhoneNumber('')
        }
    }
    
    const renderSendInviteButton = () => {
        return (
            <View style={{backgroundColor: 'dodgerblue'}}>
                <TouchableOpacity onPress={sendInviteToPhoneNumber}>
                    <Text >Invite Friend By Phone Number</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View>
            <PhoneNumberValidity phoneNumber={userToPhoneNumber} />
            <TextInput
                placeholder="Phone Number"
                onChangeText={(phoneNumber)=> setPhoneNumber(phoneNumber)}
                keyboardType={'numeric'}
                value={userToPhoneNumber}
            />
            {renderSendInviteButton()}
        </View>
    );
}

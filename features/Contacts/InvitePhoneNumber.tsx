import { useCreateInviteMutation } from "@/services/contactsApi";
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import PhoneNumberInput from "../Auth/PhoneNumberInput";
import { addSentInvite } from "./contactsSlice";

export default function InvitePhoneNumber() {
    const [userToPhoneNumber, setPhoneNumber] = useState('');
    const userFromId = useSelector((state) => state.auth.user.id);
    const [usePostCreateInvite] = useCreateInviteMutation();
    const dispatch = useDispatch();
    
    const sendInviteToPhoneNumber = async () => {
        const response = await usePostCreateInvite({userFromId, userToPhoneNumber})
        if (response) {
            dispatch(addSentInvite(response.data))
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
            <PhoneNumberInput
                onDataChange={setPhoneNumber}
                phoneNumber={userToPhoneNumber}
            />
            {renderSendInviteButton()}
        </View>
    );
}

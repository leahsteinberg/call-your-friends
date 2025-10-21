import { useCreateInviteMutation } from "@/services/contactsApi";
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import PhoneNumberInput from "../Auth/PhoneNumberInput";
import { phoneNumberIsValid } from '../Contacts/contactsUtils';
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
        const isPhoneNumberValid = phoneNumberIsValid(userToPhoneNumber)
        return (
            <View style={{ width: '70%', backgroundColor: (isPhoneNumberValid ? 'dodgerblue' : 'grey')}}>
                <TouchableOpacity
                    onPress={sendInviteToPhoneNumber}
                    disabled={!isPhoneNumberValid}
                >
                    <Text style={{textAlign: 'center'}}>Invite Friend By Phone Number</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PhoneNumberInput
                onDataChange={setPhoneNumber}
                phoneNumber={userToPhoneNumber}
            />
            {renderSendInviteButton()}
        </View>
    );

}


    const styles = StyleSheet.create({
        container: {
            //flex: 1,
            alignItems: 'center',
        }
    });

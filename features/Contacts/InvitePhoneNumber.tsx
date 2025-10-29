import { useCreateInviteMutation } from "@/services/contactsApi";
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux";
import PhoneNumberInput from "../Auth/PhoneNumberInput";
import { isPhoneNumberValid } from '../Contacts/contactsUtils';
import { addSentInvite } from "./contactsSlice";

export default function InvitePhoneNumber(): React.JSX.Element {
    const [userToPhoneNumber, setPhoneNumber] = useState<string>('');
    const userFromId: string = useSelector((state: RootState) => state.auth.user.id);
    const [usePostCreateInvite] = useCreateInviteMutation();
    const dispatch = useDispatch();
    
    const sendInviteToPhoneNumber = async (): Promise<void> => {
        const response = await usePostCreateInvite({ userFromId, userToPhoneNumber });
        if (response) {
            dispatch(addSentInvite(response.data));
            setPhoneNumber('');
        }
    };
    
    const renderSendInviteButton = (): React.JSX.Element => {
        const phoneNumberValid = isPhoneNumberValid(userToPhoneNumber);
        return (
            <View style={{ width: '70%', backgroundColor: (phoneNumberValid ? 'dodgerblue' : 'grey') }}>
                <TouchableOpacity
                    onPress={sendInviteToPhoneNumber}
                    disabled={!isPhoneNumberValid}
                >
                    <Text style={{ textAlign: 'center' }}>Invite Friend By Phone Number</Text>
                </TouchableOpacity>
            </View>
        );
    };

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
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        }
    });

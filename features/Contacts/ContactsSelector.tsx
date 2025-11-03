import { useCreateInviteMutation } from "@/services/contactsApi";
import { CHOCOLATE_COLOR } from "@/styles/styles";
import * as Contacts from "expo-contacts";
import React, { useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import { addSentInvite } from "./contactsSlice";
import { createSmsUrl, processContact } from "./contactsUtils";

export default function ContactsSelector(): React.JSX.Element {
    const [permissionStatus, setPermissionStatus] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [createInvite] = useCreateInviteMutation();
    const userFromId: string = useSelector((state: RootState) => state.auth.user.id);

    useEffect(()=> {
        checkContactsPermission()            
    }, [])

    const checkContactsPermission = async (): Promise<void> => {
        const hasPermission = await Contacts.getPermissionsAsync();
        try {
            setPermissionStatus(hasPermission.granted);
        } catch {
            console.log("error here");
        }
    };

    const openContactsPicker = async (): Promise<void> => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                const chosenContact = await Contacts.presentContactPickerAsync();
                // console.log("chosen Contact ", chosenContact);
                await selectContact(chosenContact);
            }
        } catch {
            console.log("error in requesting permission");
        }
    };

    const openSMSInvite = async (token: string, phoneNumber: string): Promise<void> => {
        const url = createSmsUrl(token, phoneNumber);
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                const result = await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'SMS is not available on this device.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not open SMS composer.');
        }
    };

    const selectContact = async (chosenContact: Contacts.Contact | null): Promise<void> => {
        if (!chosenContact) {
            console.log("No contact selected");
            return;
        }
        const friendUser = processContact(chosenContact);
        const userToPhoneNumber = friendUser.digits;
        const response = await createInvite({ userFromId, userToPhoneNumber }).unwrap();
        if (response) {
            dispatch(addSentInvite(friendUser));
            await openSMSInvite(response.token, userToPhoneNumber);
        } else {
            console.log("error with response from create invite");
        }
    };

    return (
        <View style={styles.button}>
            <TouchableOpacity onPress={openContactsPicker}>
                <Text style={styles.text}>Add a friend from your phone contacts.</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: CHOCOLATE_COLOR,
        margin: 5,
        padding: 10,
        borderRadius: 3,
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
        color: 'white',
    },
    buttonContainer: {
    },
});
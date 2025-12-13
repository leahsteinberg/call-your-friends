import { useCreateInviteMutation, useUserByPhoneMutation } from "@/services/contactsApi";
import { CREAM, ORANGE } from "@/styles/styles";
import * as Contacts from "expo-contacts";
import React, { useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import { addSentInvite } from "./contactsSlice";
import { cleanPhoneNumber, createSmsUrl, processContact } from "./contactsUtils";

export default function ContactsSelector() {
    const [permissionStatus, setPermissionStatus] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [createInvite] = useCreateInviteMutation();
    const [findUserByPhone] = useUserByPhoneMutation();

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
        const userToPhoneNumber = cleanPhoneNumber(friendUser.digits);
        
        const response = await createInvite({ userFromId, userToPhoneNumber }).unwrap();
        if (response) {
            if (userToPhoneNumber) {
                const user = await findUserByPhone({userPhoneNumber: userToPhoneNumber}).unwrap();
                console.log("Is there a user???", !!user, user);
                if (user) {
                    
                }

                dispatch(addSentInvite(friendUser));
                await openSMSInvite(response.token, userToPhoneNumber);
                return;
            }
        Alert.alert('Error', 'Could not invite contact.');
        
        }
    };

    return (
        <TouchableOpacity style={styles.fab} onPress={openContactsPicker}>
            <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: ORANGE,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    fabText: {
        fontSize: 32,
        color: CREAM,
        fontWeight: '300',
        lineHeight: 32,
    },
})

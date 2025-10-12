import { useCreateInviteMutation } from "@/services/contactsApi";
import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { addSentInvite } from "./contactsSlice";
import { createSmsUrl, processContact } from "./contactsUtils";



export default function ContactsSelector(){
    const [permissionStatus, setPermissionStatus] = useState(false);
    const dispatch = useDispatch();
    const [createInvite] = useCreateInviteMutation();
    const userFromId = useSelector((state) => state.auth.user.id);

    console.log("Contacts Selector")
    useEffect(()=> {
        checkContactsPermission()            
    }, [])

    const checkContactsPermission = async () => {
        const hasPermission = await Contacts.getPermissionsAsync();
        try {
            setPermissionStatus(hasPermission.granted)
        } catch {
            console.log("error here");
        }
    }
    const openContactsPicker = async () => {
        try {
            const {status} = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                const chosenContact = await Contacts.presentContactPickerAsync();
                console.log("chosen Contact ", chosenContact);
                await selectContact(chosenContact);
            }
        }
        catch {
            console.log("error in requesting permission");
        }
    }

    const openSMSInvite = async (token, phoneNumber) => {
        const url = createSmsUrl(token, phoneNumber)
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
    }

    const selectContact = async (chosenContact) => {
        const friendUser = processContact(chosenContact)
        const userToPhoneNumber = friendUser.digits
        const response = await createInvite({userFromId, userToPhoneNumber}).unwrap()
        if (response) {
            dispatch(addSentInvite(friendUser));
            await openSMSInvite(response.token, userToPhoneNumber)
        } else {
            console.log("error with response from create invite")
        }
    }

    return (
        <View>
            <TouchableOpacity onPress={openContactsPicker}>
                <Text>Add a friend from your phone contacts.</Text>
            </TouchableOpacity>
        </View>
    )
}
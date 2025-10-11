import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";


export default function ContactsSelector({selectContact}){
    const [permissionStatus, setPermissionStatus] = useState(false);

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

    return (
        <View>
            <TouchableOpacity onPress={openContactsPicker}>
                <Text>Add a friend from your phone contacts.</Text>
            </TouchableOpacity>
        </View>
    )
}
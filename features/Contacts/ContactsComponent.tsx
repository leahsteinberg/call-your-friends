import { useCreateInviteMutation } from "@/services/contactsApi";
import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ContactEntry from "./ContactEntryComponent";
import { addContact } from "./contactsSlice";
import { buildFriendUser, fakeContact, pickPhoneNumber } from "./contactsUtils";


export default function ContactsComponent(){
    const [permissionStatus, setPermissionStatus] = useState(false);
    const dispatch = useDispatch();
    const contacts = useSelector((state)=> state.contacts.friends);
    const userFromId = useSelector((state) => state.auth.user.id);
    const [usePostCreateInvite] = useCreateInviteMutation();
    useEffect(()=> {
        checkPermission()
    }, [])

    const checkPermission = async () => {
        const hasPermission = await Contacts.getPermissionsAsync();
        try {
            setPermissionStatus(hasPermission.granted)
        } catch {
            console.log("error here");
        }
    }

    const createSMSInvite = async (token, phoneNumber) => {
        const message = `This is your invite to join me on Call Your Friends, an app to make planning to talk easier! Here is your link token: ${token}`
        const url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
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
        const chosenPhone = pickPhoneNumber(chosenContact?.phoneNumbers);
        const friendUser = buildFriendUser(chosenContact, chosenPhone);
        const userToPhoneNumber = friendUser.digits
        dispatch(addContact(friendUser));
            // TODO - make so you cannot re-add the same person in invite
            // need state for who you've invited - show them as such, and if user selects them,
            // inform that they have already chosen them.
        const response = await usePostCreateInvite({userFromId, userToPhoneNumber}).unwrap()
        await createSMSInvite(response.token, userToPhoneNumber)
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
    const contactEntries = (contact) => {
        return (
        <View key={contact.index} style={styles.item}>
             <ContactEntry contact={contact.item}/>
        </View>
        );
    }

    const devFakeFriendButton = () => {
        return (
        <View >
            <TouchableOpacity onPress={() => selectContact(fakeContact)}>
                <Text>Add dev tools fake friend.</Text>
            </TouchableOpacity>
        </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.component}>
                <TouchableOpacity onPress={openContactsPicker}>
                    <Text>Add a friend you want.</Text>
                </TouchableOpacity>
            </View>
            {(process.env.EXPO_PUBLIC_DEV_FLAG === "true") && devFakeFriendButton()}
            <View style={styles.listContainer}>
                <FlatList
                    data={contacts}
                    renderItem={contactEntries}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightpink',
    },
    component: {
        height: 50,
    },
    listContainer: {
        // flex: 1,
        height: 100,
        backgroundColor: 'lightgreen',
    },
    item: {
        // padding: 10,
        // fontSize: 18,
        // height: 44,
    },
});
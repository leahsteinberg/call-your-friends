import { DEV_FLAG } from "@/environment";
import { useAcceptInviteMutation, useCreateInviteMutation, useGetFriendsMutation } from "@/services/contactsApi";
import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ContactEntry from "./ContactEntryComponent";
import { addContact } from "./contactsSlice";
import { createSmsUrl, fakeContact, processContact } from "./contactsUtils";
import Friends from "./Friends";
import InvitePhoneNumber from "./InvitePhoneNumber";


export default function ContactsComponent(){
    const [permissionStatus, setPermissionStatus] = useState(false);
    const dispatch = useDispatch();
    const contacts = useSelector((state)=> state.contacts.friends);
    const [friends, setFriends] = useState([]);
    const userFromId = useSelector((state) => state.auth.user.id);
    const [usePostCreateInvite] = useCreateInviteMutation();
    const [usePostAcceptInvite] = useAcceptInviteMutation();
    const [getFriends] = useGetFriendsMutation();

    useEffect(()=> {
        checkPermission()
        handleGetFriends();
        
    }, [])

    const handleGetFriends = async () => {
       const friendsResult = await getFriends({id: userFromId});
       console.log("in handle get friends, ", friendsResult);
       setFriends(friendsResult.data);
    }

    const checkPermission = async () => {
        const hasPermission = await Contacts.getPermissionsAsync();
        try {
            setPermissionStatus(hasPermission.granted)
        } catch {
            console.log("error here");
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
        dispatch(addContact(friendUser));
            // TODO - make so you cannot re-add the same person in invite
            // need state for who you've invited - show them as such, and if user selects them,
            // inform that they have already chosen them.
        const response = await usePostCreateInvite({userFromId, userToPhoneNumber}).unwrap()
        await openSMSInvite(response.token, userToPhoneNumber)
    }

    const sendInviteToPhoneNumber = async (userToPhoneNumber) => {
        console.log("hi send invite", userToPhoneNumber)
        const response = await usePostCreateInvite({userFromId, userToPhoneNumber})
        console.log("in sendInviteToPhoneNumber", response);
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

    const devFakeAcceptInviteButton = () => {
    return (
    <View >
        <TouchableOpacity onPress={() => usePostAcceptInvite({token: '54183880-71dc-4b5d-815c-08a7292c4e64', userToPhoneNumber: '+16193015075'})}>
            <Text>Accept Fake invite. Based on existing invite.</Text>
        </TouchableOpacity>
    </View>
    );
    }

    return (
        <View style={styles.container}>
            { DEV_FLAG &&
                <InvitePhoneNumber
                onPress={(e, phoneNumber)=> {sendInviteToPhoneNumber(phoneNumber)}}
                />
            }
            <View style={{backgroundColor: 'lightblue'}}>
                <TouchableOpacity onPress={openContactsPicker}>
                    <Text>Add a friend you want from your contacts.</Text>
                </TouchableOpacity>
            </View>
            <Friends
                friends={friends}
            />
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
import { DEV_FLAG } from "@/environment";
import { useCreateInviteMutation, useGetFriendsMutation } from "@/services/contactsApi";
import { useEffect, useState } from "react";
import { Linking, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ContactsList from "./ContactsList";
import ContactsSelector from "./ContactsSelector";
import InvitePhoneNumber from "./InvitePhoneNumber";
import { addContact } from "./contactsSlice";
import { createSmsUrl, processContact } from "./contactsUtils";

export default function ContactsComponent(){
    const dispatch = useDispatch();
    const contacts = useSelector((state)=> state.contacts.friends);
    const [friends, setFriends] = useState([]);
    const userFromId = useSelector((state) => state.auth.user.id);
    const [getFriends] = useGetFriendsMutation();
    const [createInvite] = useCreateInviteMutation();

    useEffect(()=> { handleGetFriends() }, [])

    const handleGetFriends = async () => {
       const friendsResult = await getFriends({id: userFromId});
       setFriends(friendsResult.data);
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
            dispatch(addContact(friendUser));
        }
        await openSMSInvite(response.token, userToPhoneNumber)
    }

    return (
        <View style={styles.container}>
            <View  style={styles.component}>
                <ContactsSelector 
                    selectContact={selectContact}
                />
            </View>
            <View style={styles.component}>
                <ContactsList
                    friends={friends}
                    invitesOut={contacts}
                />
            </View>
            { DEV_FLAG &&
                <View style={styles.component}>
                    <InvitePhoneNumber />
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    backgroundColor: 'lightpink',
    },
    component: {
        flex: 1,
        borderColor: 'green',
        borderWidth: 1,
        margin: 10,
        padding: 15,
    },
});
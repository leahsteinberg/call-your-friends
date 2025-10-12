import { DEV_FLAG } from "@/environment";
import { useGetFriendsMutation } from "@/services/contactsApi";
import { useEffect, useState } from "react";
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import ContactsList from "./ContactsList";
import ContactsSelector from "./ContactsSelector";
import InvitePhoneNumber from "./InvitePhoneNumber";

export default function ContactsComponent(){
    const contacts = useSelector((state)=> state.contacts.friends);
    const [friends, setFriends] = useState([]);
    const userFromId = useSelector((state) => state.auth.user.id);
    const [getFriends] = useGetFriendsMutation();

    useEffect(()=> { handleGetFriends() }, [])

    const handleGetFriends = async () => {
       const friendsResult = await getFriends({id: userFromId});
       setFriends(friendsResult.data);
    }

    return (
        <View style={styles.container}>
            <View  style={styles.component}>
                <ContactsSelector />
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
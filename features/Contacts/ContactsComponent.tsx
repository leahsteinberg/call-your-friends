import { DEV_FLAG } from "@/environment";
import { useGetFriendsMutation, useGetSentInvitesMutation } from "@/services/contactsApi";
import { useEffect, useState } from "react";
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ContactsList from "./ContactsList";
import ContactsSelector from "./ContactsSelector";
import InvitePhoneNumber from "./InvitePhoneNumber";
import { setSentInvites } from "./contactsSlice";

export default function ContactsComponent(){
    const dispatch = useDispatch();
    const userFromId = useSelector((state) => state.auth.user.id);

    const sentInvites = useSelector((state)=> state.contacts.sentInvites);
    const [getSentInvites] = useGetSentInvitesMutation();

    const [friends, setFriends] = useState([]);
    const [getFriends] = useGetFriendsMutation();

    useEffect(()=> { 
        handleGetFriends()
        handleGetSentInvites()
    
    }, [])

    const handleGetSentInvites = async () => {
        const sentInvitesResult = await getSentInvites({id: userFromId});
        if (sentInvitesResult) {
            dispatch(setSentInvites(sentInvitesResult.data))
        }
    }

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
                    sentInvites={sentInvites}
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
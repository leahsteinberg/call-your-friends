import { DEV_FLAG } from "@/environment";
import { useGetFriendsMutation, useGetSentInvitesMutation } from "@/services/contactsApi";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import ContactsList from "./ContactsList";
import ContactsSelector from "./ContactsSelector";
import InvitePhoneNumber from "./InvitePhoneNumber";
import { setSentInvites } from "./contactsSlice";
import { Friend, SentInvite } from "./types";

export default function ContactsComponent(): React.JSX.Element {
    const { height, width } = useWindowDimensions();
    const dispatch = useDispatch();
    const userFromId: string = useSelector((state: RootState) => state.auth.user.id);

    const sentInvites: SentInvite[] = useSelector((state: RootState) => state.contacts.sentInvites);
    const [getSentInvites] = useGetSentInvitesMutation();

    const [friends, setFriends] = useState<Friend[]>([]);
    const [getFriends] = useGetFriendsMutation();

    useEffect(()=> { 
        handleGetFriends()
        handleGetSentInvites()
    
    }, [])

    const handleGetSentInvites = async (): Promise<void> => {
        const sentInvitesResult = await getSentInvites({ id: userFromId });
        if (sentInvitesResult) {
            dispatch(setSentInvites(sentInvitesResult.data));
        }
    };

    const handleGetFriends = async (): Promise<void> => {
        const friendsResult = await getFriends({ id: userFromId });
        setFriends(friendsResult.data);
    };

    return (
        <View style={[styles.container, {height: height*.7, width: width*.9}]}>
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
        minHeight: 500,
        //height: 600,
        backgroundColor: 'lightpink',
    },
    component: {
        // flex: 1,
        // borderColor: 'green',
        // borderWidth: 1,
        // margin: 10,
        // padding: 15,
    },
});
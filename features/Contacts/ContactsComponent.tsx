import { DEV_FLAG } from "@/environment";
import { useGetFriendsMutation, useGetSentInvitesMutation } from "@/services/contactsApi";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import ContactsList from "./ContactsList";
import ContactsSelector from "./ContactsSelector";
import InvitePhoneNumber from "./InvitePhoneNumber";
import { setSentInvites } from "./contactsSlice";
import { Friend, SentInvite } from "./types";


export default function ContactsComponent(): React.JSX.Element {
    const dispatch = useDispatch();
    const userFromId: string = useSelector((state: RootState) => state.auth.user.id);

    const sentInvites: SentInvite[] = useSelector((state: RootState) => state.contacts.sentInvites);
    const [getSentInvites] = useGetSentInvitesMutation();

    const [friends, setFriends] = useState<Friend[]>([]);
    const [getFriends] = useGetFriendsMutation();
    const {data, isLoading, isError, error} = useGetFriendsMutation();


    useEffect(()=> { 
        async function handleGetSentInvites() {
            const sentInvitesResult = await getSentInvites({ id: userFromId });
            if (sentInvitesResult) {
                dispatch(setSentInvites(sentInvitesResult.data));
            }
        }
        async function handleGetFriends() {
            const friendsResult = await getFriends({ id: userFromId });
            setFriends(friendsResult.data);
        };

        handleGetFriends()
        handleGetSentInvites()
    }, [])

    // useEffect(() => {
    //     async function handleGetMeetings() {
    //         const meetingsResult: { data: MeetingType[] } = await getMeetings({ userFromId: userId });
    //         const processedMeetings: ProcessedMeetingType[] = await processMeetings(meetingsResult.data);
    //         setMeetings(processedMeetings);
    //     };  
    //     handleGetMeetings();
    // }, [])

    // const handleGetMeetings = async () =>  {
    //     const meetingsResult: { data: MeetingType[] } = await getMeetings({ userFromId: userId });
    //     const processedMeetings: ProcessedMeetingType[] = await processMeetings(meetingsResult.data);
    //     setMeetings(processedMeetings);
    // };  



    return (
        <View style={styles.container}>
            <View  style={styles.selectorComponent}>
                <ContactsSelector />
            </View>
            <View style={styles.listComponent}>
                <ContactsList
                    friends={friends}
                    sentInvites={sentInvites}
                />
            </View>
            { DEV_FLAG &&
                <View style={styles.inviteComponent}>
                    <InvitePhoneNumber />
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        minWidth: 300,
        maxHeight: '100%',
        width: '100%',
        justifyContent: 'space-between',
        overflow: 'scroll',
        flex: 1,
    },
    listComponent: {
        overflow: 'scroll',
        flex: 'auto',
        flexGrow: 1,
    },
    inviteComponent: {
        flex: 'auto',
        flexShrink: 0,

    },
});


// const styles = StyleSheet.create({
//     container: {
//         minHeight: 400,
//         backgroundColor: 'lightgreen',
//         justifyContent: 'space-between',
//         overflow: 'scroll'
//     },
//     component: {
//         maxHeight: '100%',
//     },
// });
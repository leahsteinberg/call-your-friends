import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { clearAuth } from "@/features/Auth/authSlice";
import { processSentInvites } from "@/features/Meetings/meetingsUtils";
import { usePostSignOutMutation } from "@/services/authApi";
import { useGetFriendInvitesMutation, useGetFriendsMutation, useGetSentInvitesMutation } from "@/services/contactsApi";
import { CORNFLOWER_BLUE } from "@/styles/styles";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import ContactsList from "./ContactsList";
import ContactsSelector from "./ContactsSelector";
import InvitePhoneNumber from "./InvitePhoneNumber";
import { setSentInvites } from "./contactsSlice";
import { Friend, FriendRequest, ProcessedSentInvite } from "./types";


export default function ContactsComponent(): React.JSX.Element {
    const dispatch = useDispatch();
    const userFromId: string = useSelector((state: RootState) => state.auth.user.id);

    const [processedSentInvites, setProcessedSentInvites] = useState<ProcessedSentInvite[]>([]);
    const [getSentInvites] = useGetSentInvitesMutation();

    const [friends, setFriends] = useState<Friend[]>([]);
    const [getFriends] = useGetFriendsMutation();

    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [getFriendInvites] = useGetFriendInvitesMutation();

    const [refreshing, setRefreshing] = useState(false);
    const [signOut] = usePostSignOutMutation();

    const handleSignOut = async () => {
        try {
            await signOut({}).unwrap();
            dispatch(clearAuth());
            router.replace('/login');
        } catch (error) {
            console.error("Sign out error:", error);
            // Even if the API call fails, clear local auth state
            dispatch(clearAuth());
            router.replace('/login');
        }
    };

    const fetchSentInvites = async () => {
        const sentInvitesResult = await getSentInvites({ id: userFromId });
        console.log("SENT INVITES", sentInvitesResult)
        if (sentInvitesResult && sentInvitesResult.data) {
            
            dispatch(setSentInvites(sentInvitesResult.data));
            const processed = await processSentInvites(sentInvitesResult.data);
            setProcessedSentInvites(processed);
        }
    };

    const fetchFriends = async () => {
        const friendsResult = await getFriends({ id: userFromId });
        setFriends(friendsResult.data);
    };

    const fetchFriendInvites = async () => {
        const friendInvitesResult = await getFriendInvites({ id: userFromId });
        if (friendInvitesResult && friendInvitesResult.data) {
            setFriendRequests(friendInvitesResult.data);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchFriends(), fetchFriendInvites(), fetchSentInvites()]);
        setRefreshing(false);
    };

    useEffect(()=> {
        fetchFriends();
        fetchFriendInvites();
        fetchSentInvites();
    }, [])


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
            { DEV_FLAG &&
                <View style={styles.inviteComponent}>
                    <InvitePhoneNumber />
                </View>
            }
            <View style={styles.listComponent}>
                <ContactsList
                    friends={friends}
                    friendRequests={friendRequests}
                    sentInvites={processedSentInvites}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                />
            </View>
            <ContactsSelector />
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexShrink: 0,
    },
    signOutButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    signOutText: {
        fontSize: 16,
        color: CORNFLOWER_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
        textDecorationLine: 'underline',
    },
    listComponent: {
        flex: 1,
        //flexGrow: 1,
    },
    inviteComponent: {
        //flex: 'auto',
        flexShrink: 0,
        //flex: 1,
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
import { CustomFonts } from "@/constants/theme";
import { clearAuth } from "@/features/Auth/authSlice";
import { processSentInvites } from "@/features/Meetings/meetingsUtils";
import { usePostSignOutMutation } from "@/services/authApi";
import { useGetFriendInvitesMutation, useGetFriendsMutation, useGetSentInvitesMutation } from "@/services/contactsApi";
import { APP_HEADER_TEXT_COLOR, CORNFLOWER_BLUE } from "@/styles/styles";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import ContactsList from "./ContactsList";
import ContactsLoader from "./ContactsLoader";
import ContactsSelector from "./ContactsSelector";
import FriendsSearchBar from "./FriendsSearchBar";
import { setSentInvites } from "./contactsSlice";
import { Friend, FriendRequest, ProcessedSentInvite } from "./types";

/** Fuzzy match: checks if all chars of query appear in order within target. */
function fuzzyMatch(target: string, query: string): boolean {
    const t = target.toLowerCase();
    const q = query.toLowerCase();
    let ti = 0;
    for (let qi = 0; qi < q.length; qi++) {
        const found = t.indexOf(q[qi], ti);
        if (found === -1) return false;
        ti = found + 1;
    }
    return true;
}

function filterFriends(friends: Friend[], query: string): Friend[] {
    if (!query.trim()) return friends;
    return friends.filter(f =>
        fuzzyMatch(f.name, query) ||
        fuzzyMatch(f.phoneNumber, query)
    );
}


export default function ContactsComponent(): React.JSX.Element {
    const dispatch = useDispatch();
    const userFromId: string = useSelector((state: RootState) => state.auth.user.id);

    const [processedSentInvites, setProcessedSentInvites] = useState<ProcessedSentInvite[]>([]);
    const [getSentInvites] = useGetSentInvitesMutation();

    const [friends, setFriends] = useState<Friend[]>([]);
    const [getFriends] = useGetFriendsMutation();
    const [searchQuery, setSearchQuery] = useState('');

    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [getFriendInvites] = useGetFriendInvitesMutation();

    const [isLoading, setIsLoading] = useState(true);
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
        if (sentInvitesResult && sentInvitesResult.data) {
            
            dispatch(setSentInvites(sentInvitesResult.data));
            const processed = await processSentInvites(sentInvitesResult.data);
            setProcessedSentInvites(processed);
        }
    };

    const fetchFriends = async () => {
        const friendsResult = await getFriends({ id: userFromId });
        if (friendsResult && friendsResult.data) {
            console.log("got friends!!!!", friendsResult.data)
            setFriends(friendsResult.data);
        }
    };

    const fetchFriendInvites = async () => {
        const friendInvitesResult = await getFriendInvites({ id: userFromId });
        console.log("got friendfriendInvitesResult", friendInvitesResult);
        if (friendInvitesResult && friendInvitesResult.data) {
            setFriendRequests(friendInvitesResult.data);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchFriends(), fetchFriendInvites(), fetchSentInvites()]);
        setRefreshing(false);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            await Promise.all([fetchFriends(), fetchFriendInvites(), fetchSentInvites()]);
            setIsLoading(false);
        };
        loadInitialData();
    }, [])
    console.log("friend Requests", friendRequests);
    console.log("SENTTT friend Requests", processedSentInvites);


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Friends</Text>
                <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.listComponent}>
                {isLoading ? (
                    <ContactsLoader />
                ) : (
                    <>
                        <ContactsList
                            friends={filterFriends(friends, searchQuery)}
                            friendRequests={searchQuery ? [] : friendRequests}
                            sentInvites={searchQuery ? [] : processedSentInvites}
                            onRefresh={handleRefresh}
                            refreshing={refreshing}
                            onCallIntentChange={fetchFriends}
                        />
                        <FriendsSearchBar query={searchQuery} onChangeQuery={setSearchQuery} />
                    </>
                )}
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
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        flexShrink: 0,
    },
    title: {
        color: APP_HEADER_TEXT_COLOR,
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 36,
        fontWeight: '600',
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
});

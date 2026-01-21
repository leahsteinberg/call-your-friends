import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { clearAuth } from "@/features/Auth/authSlice";
import { processSentInvites } from "@/features/Meetings/meetingsUtils";
import { useUserSignals } from "@/hooks/useUserSignals";
import { usePostSignOutMutation } from "@/services/authApi";
import { useGetFriendInvitesMutation, useGetFriendsMutation, useGetSentInvitesMutation } from "@/services/contactsApi";
import { APP_HEADER_TEXT_COLOR, CORNFLOWER_BLUE } from "@/styles/styles";
import { CALL_INTENT_SIGNAL_TYPE } from "@/types/userSignalsTypes";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import ContactsLoader from "./ContactsLoader";
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

    const [processedContactIntended, setProcessedContactIntended] = useState<string[]>();
    const { userSignals, isLoading } = useUserSignals();


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

    const fetchFriends = async (signals: typeof userSignals) => {
        const friendsResult = await getFriends({ id: userFromId });
        console.log("friends ===", friendsResult.data);

        // Ensure we have both friends data and signals before processing
        if (!friendsResult.data || !signals) {
            console.log("Waiting for both friends and userSignals to be ready");
            return;
        }

        const filteredUserSignals = signals
            .filter(signal => signal.type === CALL_INTENT_SIGNAL_TYPE);
        const callIntentSignalsMap = filteredUserSignals.reduce((obj, item) => {
            obj[item.payload.targetUserId] = item; // Use the id as the key for the entire object
            return obj;
            }, {})


        const processedFriends = friendsResult.data
            .map(f => ({
                ...f,
                callIntentSignal: callIntentSignalsMap[f.id] || null,
                isContactIntended: !!callIntentSignalsMap[f.id]
            }));

        setFriends(processedFriends);
    };

    const fetchFriendInvites = async () => {
        const friendInvitesResult = await getFriendInvites({ id: userFromId });
        if (friendInvitesResult && friendInvitesResult.data) {
            setFriendRequests(friendInvitesResult.data);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchFriends(userSignals), fetchFriendInvites(), fetchSentInvites()]);
        setRefreshing(false);
    };

    useEffect(()=> {
        // Only fetch when userSignals are loaded and ready
        if (!isLoading && userSignals) {
            fetchFriends(userSignals);
            fetchFriendInvites();
            fetchSentInvites();
        }
    }, [userSignals, isLoading])


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Friends</Text>
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
                {isLoading ? (
                    <ContactsLoader />
                ) : (
                    <ContactsList
                        friends={friends}
                        friendRequests={friendRequests}
                        sentInvites={processedSentInvites}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                    />
                )}
            </View>
            {
                Platform.OS !== 'web' ?
                <ContactsSelector /> :
                <></>
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
    inviteComponent: {
        //flex: 'auto',
        flexShrink: 0,
        //flex: 1,
    },
});

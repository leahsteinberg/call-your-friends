import { DEV_FLAG } from "@/environment";
import { useGetFriendsMutation, useGetSentInvitesMutation } from "@/services/contactsApi";
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from "react";
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
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
    const [pushToken, setPushToken] = useState('');

    const sentInvites: SentInvite[] = useSelector((state: RootState) => state.contacts.sentInvites);
    const [getSentInvites] = useGetSentInvitesMutation();




    async function registerForPushNotificationsAsync() {
        console.log("IN REGISTER TOKEN!!!!")
      let token;

      // Check for existing permissions and request new ones if needed
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      // Get the Expo Push Token
      token = (await Notifications.getExpoPushTokenAsync({ projectId: '7a8ce9d1-3bae-4540-a78c-da592a1f971e' })).data;
      console.log("HERE IS TH  E TOKEN", token); // Log the token to see it in your console
      setPushToken(token)
      return token;
    }

    // Call this function when your app loads or at an appropriate time
    // For example, in a useEffect hook in your main App component
    useEffect(() => {
      registerForPushNotificationsAsync();
    }, []);




    const [friends, setFriends] = useState<Friend[]>([]);
    const [getFriends] = useGetFriendsMutation();
    const {data, isLoading, isError, error} = useGetFriendsMutation();

    const DismissKeyboard = ({ children }) => (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
          {children}
        </TouchableWithoutFeedback>
      );

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


    return (
        <View style={styles.container}>
            <Text>
                PUSH TOKEN{pushToken}
            </Text>
            <DismissKeyboard>
                <View  style={styles.selectorComponent}>
                    <ContactsSelector />
                </View>
            </DismissKeyboard>
            { DEV_FLAG &&
                <View style={styles.inviteComponent}>
                    <InvitePhoneNumber />
                </View>
            }
                <View style={styles.listComponent}>
                    <ContactsList
                        friends={friends}
                        sentInvites={sentInvites}
                    />
                </View>
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
        flex: 1,
        //flexGrow: 1,
    },
    inviteComponent: {
        //flex: 'auto',
        flexShrink: 0,
        //flex: 1,
    },
    selectorComponent: {
        flexShrink: 0,
        //flex: 1,
    }
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
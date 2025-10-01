import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ContactEntry from "./ContactEntryComponent";
import { addContact } from "./contactsSlice";


export default function ContactsComponent(){
    const [permissionStatus, setPermissionStatus] = useState(false);
    const dispatch = useDispatch();
    const contacts = useSelector((state)=> state.contacts.friends);
    useEffect(()=> {
        checkPermission()
    }, [])

    const checkPermission = async () => {
        const hasPermission = await Contacts.getPermissionsAsync();
        try {
            setPermissionStatus(hasPermission.granted)
            console.log({permissionStatus})
        } catch {
            console.log("error here");
        }
    }

    const pickPhoneNumber = (phoneNumberInfos) =>  {
        if (phoneNumberInfos.length === 1) {
            return phoneNumberInfos[0];
        }
        const phoneNumber = phoneNumberInfos.find((phoneNumber)=> phoneNumber.label === "mobile" );
        return phoneNumber ? phoneNumber : phoneNumberInfos[0];
    }

    const buildFriendUser = (user, phoneNumber) => {
        const { firstName, lastName } = user;
        return {
            firstName,
            lastName,
            ...phoneNumber,
        }
    }

    const requestPermission = async () => {
        try {
            const {status} = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                const chosenContact = await Contacts.presentContactPickerAsync();
                console.log({chosenContact})
                const chosenPhone = pickPhoneNumber(chosenContact?.phoneNumbers);
                const friendUser = buildFriendUser(chosenContact, chosenPhone);
                dispatch(addContact(friendUser));
            }
        }
        catch {
            console.log("error in requesting permission");
        }
    }
  
    const contactEntries = (contactList) => {
        return contactList.map((contact, i)=> (
            <View key={i}>
                <ContactEntry contact={contact}/>
            </View>
            ));
    }
    console.log("re-rendering, contacts is - ", contacts);

    return (
        <View style={styles.container}>
            <View style={styles.component}>
            <Button
                title="Add a friend you want to talk to more."
                onPress={()=> {requestPermission()}}
            />
            {contacts ? contactEntries(contacts) : <Text>No contacts chosen</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  component: {
    padding: 20,
    backgroundColor: 'lightblue',
    alignSelf: 'stretch',
    alignItems: 'center',
  }
});
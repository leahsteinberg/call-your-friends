import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from 'react-native';
import ContactEntry from "./ContactEntryComponent";

export default function ContactsComponent(){
    const [permissionStatus, setPermissionStatus] = useState(false);
    const [contacts, setContacts] = useState([]);

    useEffect(()=> {
        checkPermission()
    }, [])

    const checkPermission = async () => {
        const hasPermission = await Contacts.getPermissionsAsync();
        try {
            console.log(hasPermission.granted);
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

    const requestPermission = async () => {
        try {
            console.log("requesting permission!!")
            const {status} = await Contacts.requestPermissionsAsync();
            console.log({status});
            if (status === "granted") {
                const result = await Contacts.presentContactPickerAsync();
                console.log({result})
                const phoneNumber = pickPhoneNumber(result?.phoneNumbers);
                console.log("Chosen Phone Number ---", phoneNumber);
                setContacts([...contacts, result]);
            }
        }
        catch {
            console.log("error in requesting permission");
        }
    }
    // const contactText = (contactList) => {
    //     return contactList.map((contact, i) => <Text key={i} >Contact is {contact.firstName} {contact.lastName}</Text>)
    // }
    const contactEntries = (contactList) => {
        return contactList.map((contact, i)=> (
            <View>
                <ContactEntry/>
                <Text key={i}>Contact is {contact.firstName} {contact.lastName}</Text>
            </View>
            ));
    }

    return (
        <View style={styles.container}>
            <View>
            <Text>I am the contacts component</Text>
        
            <Button
                title="Add a friend you want to talk to more."
                onPress={()=> {requestPermission()}}
            />
            {(contacts.length > 0) ? contactEntries(contacts) : <Text>No contacts chosen</Text>}
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
import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from 'react-native';


export default function ContactsComponent(){
    const [permissionStatus, setPermissionStatus] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);

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
                const phoneNumber = pickPhoneNumber(result?.phoneNumbers);
            }
        }
        catch {
            console.log("error in requesting permission");
        }
    }

    return (
        <View style={styles.container}>
            <View>
            <Text>I am the contacts component</Text>
          
            <Button
                title="Add a friend you want to talk to more."
                onPress={()=> {requestPermission()}}
            />
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
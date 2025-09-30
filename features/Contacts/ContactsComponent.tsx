import * as Contacts from "expo-contacts";
import { Button, StyleSheet, Text, View } from 'react-native';


export default function ContactsComponent(){

    const requestPermission = async () => {
        try {
            console.log("reqeuesting permission!!")
            const {status} = await Contacts.requestPermissionsAsync();
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
                title="Grant Permission to View your contacts"
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
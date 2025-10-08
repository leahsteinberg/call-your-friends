import { StyleSheet, Text, View } from "react-native";

export default function ContactEntry({contact}) {
  return (
  <View style={styles.container}>
    <Text >{contact.firstName} {contact.lastName} </Text>
  </View>);
}


const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'lightgreen',
    // height: '300px',
    // maxWidth: '100px',
    // fontSize: '70px',
    // flex: 1, // Ensures the View takes up the entire screen
    // justifyContent: 'center',
    // alignItems: 'center',
  }
})
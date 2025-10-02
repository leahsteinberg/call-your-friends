import { StyleSheet, Text, View } from "react-native";

export default function ContactEntry({contact}) {
  return (<View style={styles.container}>
    <Text >{contact.firstName} {contact.lastName} </Text>
  </View>);
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'green',
    flex: 1, // Ensures the View takes up the entire screen
    justifyContent: 'center',
    alignItems: 'center',
  }
})
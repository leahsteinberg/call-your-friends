import { StyleSheet, Text, View } from "react-native";

export default function InvitedContact({contact}) {
  return (
    <View style={styles.container} key={contact.index}>
      <Text >{contact.userToPhoneNumber} </Text>
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
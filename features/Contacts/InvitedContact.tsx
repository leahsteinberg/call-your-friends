import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatPhoneNumber } from "./contactsUtils";
import { InvitedContactProps } from "./types";

export default function InvitedContact({ contact }: InvitedContactProps): React.JSX.Element {

  const phoneNumber = formatPhoneNumber(contact.item.userToPhoneNumber)
  return (
    <View style={styles.container} key={contact.index}>
      <Text style={styles.component}>{phoneNumber}</Text>
      <Text style={styles.component}>{contact.item.createdAt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'lightgreen',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    // height: '300px',
    // maxWidth: '100px',
    // fontSize: '70px',
    flex: 1, // Ensures the View takes up the entire screen
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  component: {

  }
})
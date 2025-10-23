import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { InvitedContactProps } from "./types";

export default function InvitedContact({ contact }: InvitedContactProps): React.JSX.Element {
  return (
    <View style={styles.container} key={contact.index}>
      <Text>{contact.item.userToPhoneNumber}</Text>
    </View>
  );
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
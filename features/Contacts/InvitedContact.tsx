import { LIGHT_BEIGE } from "@/styles/styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import PhoneNumberDisplay from "../Common/PhoneNumberDisplay";
import { InvitedContactProps } from "./types";

export default function InvitedContact({ contact }: InvitedContactProps): React.JSX.Element {

  return (
    <View style={styles.container} key={contact.index}>
      <Text style={styles.component}>{contact.item.createdAt} </Text>
      <PhoneNumberDisplay digits={contact.item.userToPhoneNumber}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: LIGHT_BEIGE,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 5,

    marginVertical: 3,
    marginHorizontal: 10,

    borderRadius: 15,
    flex: 1, // Ensures the View takes up the entire screen



    // flexDirection: 'row',
    // backgroundColor: LIGHT_BEIGE,
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // marginVertical: 3,
    // paddingVertical: 3,
    // paddingHorizontal: 5,
    // borderRadius: 10,
    // flex: 1, // Ensures the View takes up the entire screen


  },
  component: {

  }
})
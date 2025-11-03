import { BRIGHT_BLUE, LIGHT_BEIGE } from "@/styles/styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import PhoneNumberDisplay from "../Common/PhoneNumberDisplay";
import { FriendProps } from "./types";

export default function Friend({ item }: FriendProps): React.JSX.Element {
  return (
    <View style={styles.container} key={item.index}>
      <Text style={styles.name}>{item.name}</Text>
      <PhoneNumberDisplay digits={item.phoneNumber}/>
      </View>
  );
}

const styles = StyleSheet.create({
    container: { 
      flexDirection: 'row',
      backgroundColor: LIGHT_BEIGE,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 3,
      paddingVertical: 3,
      paddingHorizontal: 5,
      marginHorizontal: 10,
      borderRadius: 15,
      flex: 1, // Ensures the View takes up the entire screen

    },
    name: {
      color: BRIGHT_BLUE,
      fontWeight: 900,
      flexGrow: 1,
      paddingVertical: 10,
      borderRadius: 18,
      paddingLeft: 5,

      
    },
});
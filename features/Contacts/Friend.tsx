import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatPhoneNumber } from "./contactsUtils";
import { FriendProps } from "./types";

export default function Friend({ item }: FriendProps): React.JSX.Element {
  return (
    <View
      style={styles.container}
      key={item.index}
    >
      <Text>{item.name}</Text>
      <Text> {formatPhoneNumber(item.phoneNumber)}</Text>
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
    },
});
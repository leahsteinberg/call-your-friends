import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FriendProps } from "./types";

export default function Friend({ item }: FriendProps): React.JSX.Element {
  return (
    <View
      style={styles.container}
      key={item.index}
    >
      <Text>{item.name} {item.phoneNumber}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {      
    },
    component: {
    },
});
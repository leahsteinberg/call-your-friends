import { StyleSheet, Text, View } from "react-native";

export default function Friend(friend) {

  return (
    <View
      style={styles.container}
      key={friend.index}
    >
      <Text>{friend.item.name} {friend.item.phoneNumber}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {      
    },
    component: {
    },
});
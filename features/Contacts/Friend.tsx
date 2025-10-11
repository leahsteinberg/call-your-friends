import { Text, View } from "react-native";

export default function Friend(friend) {

  return (<View key={friend.index}>
            <Text>**{friend.item.name} {friend.item.phoneNumber}</Text>
        </View>
        );
}
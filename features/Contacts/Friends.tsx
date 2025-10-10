import { FlatList, Text, View } from "react-native";

export default function Friends({friends}) {
    console.log("in friends", friends);

    const renderFriend = (friend) => {
        console.log("in friend", friend);
        return (<View key={friend.index} >
            <Text>**{friend.item.name} {friend.item.phoneNumber}</Text>

        </View>
        );
    }

  return (
  <View style={{backgroundColor: 'lightyellow'}}>
    <Text>These are your friends</Text>
    <FlatList
        data={friends}
        renderItem={renderFriend}
    />
  </View>);
}
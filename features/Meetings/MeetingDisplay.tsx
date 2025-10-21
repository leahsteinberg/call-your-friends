import { Text, View } from "react-native";

export default function MeetingDisplay({meeting}) {


  return (<View key={meeting.index}>
            <Text>{meeting.item.displayScheduledFor}</Text>
            {/* <Text>**{meeting.item.name} {friend.item.phoneNumber}</Text> */}
        </View>
        );
}
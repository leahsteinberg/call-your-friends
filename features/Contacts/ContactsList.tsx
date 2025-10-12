import { SectionList, Text, View } from "react-native";
import Friend from "./Friend";
import InvitedContact from "./InvitedContact";

export default function ContactsList ({friends, sentInvites}){
    const sectionListData = [
        {
            title: "Invites You've Sent",
            data: sentInvites,
            renderItem: (sentInvite) => (<InvitedContact contact={sentInvite.item}/>)
        },
        {
            title: "Your Friends",
            data: friends,
            renderItem: (friend) => (<Friend item={friend.item}/>)
        }
    ];

    return (
        <View>
            <SectionList
                sections={sectionListData}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section: {title}}) =>
                    <Text style={{fontWeight: 'bold'}}>{title}</Text>
                }
            />
        </View>);
}
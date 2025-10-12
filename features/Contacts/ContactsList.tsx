import { SectionList, Text, View } from "react-native";
import Friend from "./Friend";
import InvitedContact from "./InvitedContact";

export default function ContactsList ({friends, invitesOut}){

    console.log("Invites out", invitesOut)

    const sectionListData = [
        {
            title: "Invites You've Sent",
            data: invitesOut,
            renderItem: (contact) => (<InvitedContact contact={contact.item}/>)
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
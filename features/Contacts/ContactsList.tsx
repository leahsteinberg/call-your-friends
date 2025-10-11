import { SectionList, Text, View } from "react-native";
import ContactEntry from "./ContactEntryComponent";
import Friend from "./Friend";

export default function ContactsList ({friends, invitesOut}){

    const invitesOutEntries = (contact) => {
        return (
        <View key={contact.index} >
             <ContactEntry contact={contact.item}/>
        </View>
        );
    }
    console.log("Invites out", invitesOut)

    const sectionListData = [
        {
            title: "Invites You've Sent",
            data: invitesOut,
            renderItem: invitesOutEntries
        },
        {
            title: "Your Friends",
            data: friends,
            renderItem: (friend) => (<Friend item={friend.item} />)
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
import { PALE_BLUE } from "@/styles/styles";
import React from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import Friend from "./Friend";
import InvitedContact from "./InvitedContact";
import { ContactsListProps, Friend as FriendType, SentInvite } from "./types";

export default function ContactsList({ friends, sentInvites }: ContactsListProps): React.JSX.Element {
   
    const friendListData = 
    {
        title: "Friends",
        data: friends,
        renderItem: ({ item, index }: { item: FriendType; index: number }) => 
            (<Friend item={{ ...item, index }} />)
    };

    const invitedListData = 
    {
        title: "Waiting for these friends to join the fun:",
        data: sentInvites,
        renderItem: ({ item, index }: { item: SentInvite; index: number }) => 
            (<InvitedContact contact={{ item, index }} />)
    };
   
    
    const sectionListData =  (
        sentInvites.length > 0
            ? [friendListData, invitedListData]
            : [friendListData]
        ) as any;



    return (
        <View style={styles.container}>
            <SectionList
                sections={sectionListData}
                keyExtractor={(item, index) => item.id + index}
                renderSectionHeader={({section: {title}}) =>
                    <Text style={styles.sectionHeader}>{title}</Text>

                    // <Text style={[{fontWeight: 'bold'}, styles.sectionHeader]}>{title}</Text>
                }
                stickySectionHeadersEnabled={true} // Enable sticky headers
            />
        </View>);
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionHeader: {
        padding:10,
        backgroundColor: PALE_BLUE,
        fontWeight: 'bold',
        borderRadius: 5,
        marginHorizontal: 10,
    }
});
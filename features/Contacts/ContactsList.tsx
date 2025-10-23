import React from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import Friend from "./Friend";
import InvitedContact from "./InvitedContact";
import { ContactsListProps, Friend as FriendType, SentInvite } from "./types";

export default function ContactsList({ friends, sentInvites }: ContactsListProps): React.JSX.Element {
    const sectionListData = [
        {
            title: "Invites You've Sent",
            data: sentInvites,
            renderItem: ({ item, index }: { item: SentInvite; index: number }) => 
                (<InvitedContact contact={{ item, index }} />)
        },
        {
            title: "Your Friends",
            data: friends,
            renderItem: ({ item, index }: { item: FriendType; index: number }) => 
                (<Friend item={{ ...item, index }} />)
        }
    ] as any;

    return (
        <View style={styles.container}>
            <SectionList
                sections={sectionListData}
                keyExtractor={(item, index) => item.id + index}
                renderSectionHeader={({section: {title}}) =>
                    <Text style={{fontWeight: 'bold'}}>{title}</Text>
                }
            />
        </View>);
}


const styles = StyleSheet.create({
    container: {
        margin: 20,

    },
})
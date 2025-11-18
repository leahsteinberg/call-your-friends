import { CREAM, PALE_BLUE } from "@/styles/styles";
import React from "react";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import Friend from "./Friend";
import InvitedContact from "./InvitedContact";
import { ContactsListProps, Friend as FriendType, SentInvite } from "./types";

interface ContactsListPropsExtended extends ContactsListProps {
    onRefresh?: () => void;
    refreshing?: boolean;
}

export default function ContactsList({ friends, sentInvites, onRefresh, refreshing = false }: ContactsListPropsExtended): React.JSX.Element {



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
            style={styles.sectionList}
                sections={sectionListData}
                keyExtractor={(item, index) => item.id + index}
                renderSectionHeader={({section: {title}}) =>
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionHeader}>{title}</Text>
                    </View>
                    // <Text style={[{fontWeight: 'bold'}, styles.sectionHeader]}>{title}</Text>
                }
                stickySectionHeadersEnabled={true} // Enable sticky headers
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    ) : undefined
                }
            />
        </View>);
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionList: {
        removeClippedSubviews: false,

    },
    sectionHeaderContainer: {
        backgroundColor: CREAM,
        marginHorizontal: 10,
        borderBottomLeftRadius: 5,
    },
    sectionHeader: {
        paddingVertical:10,
        backgroundColor: PALE_BLUE,
        fontWeight: 'bold',
        borderRadius: 5,
    }
});
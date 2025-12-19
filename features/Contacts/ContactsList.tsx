import { CustomFonts } from "@/constants/theme";
import { DARK_GREEN } from "@/styles/styles";
import React from "react";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import Friend from "./Friend";
import FriendRequest from "./FriendRequest";
import InvitedContact from "./InvitedContact";
import { ContactsListProps, Friend as FriendType } from "./types";

interface ContactsListPropsExtended extends ContactsListProps {
    onRefresh?: () => void;
    refreshing?: boolean;
}

export default function ContactsList({ friends, friendRequests, sentInvites, onRefresh, refreshing = false }: ContactsListPropsExtended): React.JSX.Element {



    const friendListData =
    {
        //title: "Friends",
        data: friends,
        renderItem: ({ item, index }: { item: FriendType; index: number }) =>
            (<Friend item={{ ...item, index }} />)
    };

    const friendRequestsListData =
    {
        title: "Friend Requests",
        data: friendRequests,
        renderItem: ({ item, index }: { item: any; index: number }) =>
            (<FriendRequest item={{ ...item, index }} />)
    };

    const invitedListData =
    {
        title: "Waiting for these friends to join the fun:",
        data: sentInvites,
        renderItem: ({ item, index }: { item: any; index: number }) =>
            (<InvitedContact contact={{ item, index }} />)
    };


    const sections = [];
    sections.push(friendListData);
    if (friendRequests.length > 0) {
        sections.push(friendRequestsListData);
    }
    if (sentInvites.length > 0) {
        sections.push(invitedListData);
    }

    const sectionListData = sections as any;



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
                }
                stickySectionHeadersEnabled={true}
                removeClippedSubviews={false}
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
        flex: 1,
    },
    sectionHeaderContainer: {
        //backgroundColor: CREAM,
        paddingHorizontal: 10,
        paddingTop: 12,
        paddingBottom: 8,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturemedium,
    }
});
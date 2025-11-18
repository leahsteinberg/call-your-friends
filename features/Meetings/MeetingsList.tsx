import { DARK_BLUE, PALE_BLUE } from "@/styles/styles";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import MeetingCard from "../Common/MeetingCard";
import OfferCard from "../Common/OfferCard";
import { ProcessedOfferType } from "../Offers/types";
import { MeetingsListProps, ProcessedMeetingType } from "./types";


export default function MeetingsList({ meetings, offers, refresh, refreshing }: MeetingsListProps) {

    const meetingsListData = {
        title: "Chats Planned:",
        data: meetings,
        renderItem: ({ item }: { item: ProcessedMeetingType }) =>
            <MeetingCard meeting={item} />
    };
    const offersListData = {
        title: "Offers:",
        data: offers,
        renderItem: ({ item }: { item: ProcessedOfferType }) =>
            <OfferCard offer={item} />
    }

    const sectionListData = offers.length > 0 ? [offersListData, meetingsListData] : [meetingsListData];
    
    return (
        <View style={styles.container}>
            <SectionList
            style={styles.sectionList}
            keyExtractor={(item, index) => item.id + index}
            renderSectionHeader={({section: {title}}) =>
                    <Text style={styles.sectionHeader}>{title}</Text>
                }
            sections={sectionListData}
            stickySectionHeadersEnabled={true} // Enable sticky headers
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refresh}
                    tintColor={PALE_BLUE}
                />
            }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
       flex: 1,
    },
    sectionList: {
        removeClippedSubviews: false,
    },
    sectionHeader: {
        borderRadius: 10,
        padding: 10,
        backgroundColor: PALE_BLUE,
        fontWeight: 'bold',
        color: DARK_BLUE,
    },
});
import { DARK_BLUE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import AcceptedBroadcastMeetingCard from "../Common/AcceptedBroadcastMeetingCard";
import BroadcastMeetingCard from "../Common/BroadcastMeetingCard";
import BroadcastOfferCard from "../Common/BroadcastOfferCard";
import MeetingCard from "../Common/MeetingCard";
import OfferCard from "../Common/OfferCard";
import { ProcessedOfferType } from "../Offers/types";
import { MeetingsListProps, ProcessedMeetingType } from "./types";


export default function MeetingsList({ meetings, offers, refresh, refreshing }: MeetingsListProps) {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    const meetingsListData = {
        title: "Chats Planned:",
        data: meetings,
        renderItem: ({ item }: { item: ProcessedMeetingType }) => {
            if (item.meetingType === 'BROADCAST') {
                // Check if user created this broadcast or accepted it
                const selfCreated = item.userFromId === userId;
                if (selfCreated) {
                    return <BroadcastMeetingCard meeting={item} />;
                } else {
                    return <AcceptedBroadcastMeetingCard meeting={item} />;
                }
            }
            return <MeetingCard meeting={item} />;
        }
    };
    const offersListData = {
        title: "Offers:",
        data: offers,
        renderItem: ({ item }: { item: ProcessedOfferType }) => {
            if (item.offerType === 'BROADCAST') {
                return <BroadcastOfferCard offer={item} refresh={refresh} />;
            }
            return <OfferCard offer={item} refresh={refresh} />;
        }
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
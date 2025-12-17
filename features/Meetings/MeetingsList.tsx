import { DARK_BLUE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { PAST_MEETING_STATE } from "@/types/meetings-offers";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import MeetingCard from "../EventCards/MeetingCard";
import OfferCard from "../EventCards/OfferCard";
import OtherMeetingBroadcastCard from "../EventCards/OtherMeetingBroadcastCard";
import OtherOfferBroadcastCard from "../EventCards/OtherOfferBroadcastCard";
import SelfBroadcastCard from "../EventCards/SelfBroadcastCard";
import { ProcessedOfferType } from "../Offers/types";
import { isBroadcastOffer } from "../Offers/offerHelpers";
import { MeetingsListProps, ProcessedMeetingType } from "./types";
import { isBroadcastMeeting } from "./meetingHelpers";


export default function MeetingsList({ meetings, offers, refresh, refreshing }: MeetingsListProps) {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    const meetingsListData = {
        title: "Chats Planned:",
        data: meetings,
        renderItem: ({ item }: { item: ProcessedMeetingType }) => {
            if (isBroadcastMeeting(item) && item.meetingState !== PAST_MEETING_STATE) {
                const selfCreated = item.userFromId === userId;
                if (selfCreated) {
                    return <SelfBroadcastCard meeting={item} />;
                } else {
                    return <OtherMeetingBroadcastCard meeting={item} />;
                }
            }
            return <MeetingCard meeting={item} />;
        }
    };
    const offersListData = {
        title: "Offers:",
        data: offers,
        renderItem: ({ item }: { item: ProcessedOfferType }) => {
            if (isBroadcastOffer(item)) {
                return <OtherOfferBroadcastCard offer={item} />;
            }
            return <OfferCard offer={item} />;
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
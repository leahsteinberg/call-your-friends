import { CREAM, ORANGE } from "@/styles/styles";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import Offer from "../Offers/Offer";
import MeetingDisplay from "./MeetingDisplay";
import { MeetingType, MeetingsListProps } from "./types";


export default function MeetingsList({ meetings, offers, refresh, refreshing }: MeetingsListProps) {
    console.log("offers is", offers)

    const meetingsListData =         {
        title: "Chats Planned:",
        data: meetings,
        renderItem: ({ item, index }: { item: MeetingType; index: number }) => 
            (<MeetingDisplay
                meeting={{ item, index }}
            />)
    };
    const offersListData =         {
        title: "Offers:",
        data: offers,
        renderItem: ({ item, index }: { item: OfferType; index: number }) =>
            <Offer offer={item}/>
    }


    const sectionListData = offers.length > 0 ? [meetingsListData, offersListData] : [meetingsListData];
    
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
                        tintColor={ORANGE}
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
        backgroundColor: ORANGE,
        fontWeight: 'bold',
        color: CREAM,

    },
});
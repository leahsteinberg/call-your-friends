import { CREAM, ORANGE } from "@/styles/styles";
import { SectionList, StyleSheet, Text, View } from "react-native";
import Offer from "../Offers/Offer";
import MeetingDisplay from "./MeetingDisplay";
import { MeetingType, MeetingsListProps } from "./types";


export default function MeetingsList({ meetings, offers }: MeetingsListProps) {
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
        title: "Offers",
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
                />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        //overflow: 'scroll',
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
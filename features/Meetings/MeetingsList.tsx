import { PEACH } from "@/styles/styles";
import { SectionList, StyleSheet, Text, View } from "react-native";
import Offer from "../Offers/Offer";
import MeetingDisplay from "./MeetingDisplay";
import { MeetingType, MeetingsListProps } from "./types";


export default function MeetingsList({ meetings, offers }: MeetingsListProps) {
    console.log("offers is", offers)
    const sectionListData = [
        {
            title: "Chats Planned:",
            data: meetings,
            renderItem: ({ item, index }: { item: MeetingType; index: number }) => 
                (<MeetingDisplay
                    meeting={{ item, index }}
                />)
        },
        {
            title: "Offers",
            data: offers,
            renderItem: ({ item, index }: { item: OfferType; index: number }) =>
                <Offer offer={item}/>
            
        }

    ];
    
    return (
        <View style={styles.container}>
                <SectionList
                    sections={sectionListData}
                    keyExtractor={(item, index) => item.id + index}
                    renderSectionHeader={({section: {title}}) =>
                        <Text style={styles.sectionHeader}>{title}</Text>
                    }
                    stickySectionHeadersEnabled={true} // Enable sticky headers
                />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        maxHeight: 200,
    },
    sectionHeader: {
        padding: 10,
        borderRadius: 10,
        padding:10,
        backgroundColor: PEACH,
        fontWeight: 'bold'
    },
});
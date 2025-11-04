import { PEACH } from "@/styles/styles";
import { SectionList, StyleSheet, Text, View } from "react-native";
import MeetingDisplay from "./MeetingDisplay";
import { MeetingType, MeetingsListProps } from "./types";

export default function MeetingsList({ meetings }: MeetingsListProps) {
    const sectionListData = [
        {
            title: "Chats Planned:",
            data: meetings,
            renderItem: ({ item, index }: { item: MeetingType; index: number }) => 
                (<MeetingDisplay
                    meeting={{ item, index }}
                />)
        },
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
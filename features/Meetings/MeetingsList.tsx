import { BRIGHT_BLUE, PEACH } from "@/styles/styles";
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
                        <Text style={{padding:10, backgroundColor: PEACH, fontWeight: 'bold'}}>{title}</Text>
                    }
                    stickySectionHeadersEnabled={true} // Enable sticky headers
                />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        maxHeight: 200,
        backgroundColor: BRIGHT_BLUE,
    },
    sectionHeading: {
        padding: 10,
    },
});
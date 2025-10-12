import { SectionList, Text, View } from "react-native";

export default function MeetingsList({meetings}) {
    console.log("MeetingsList({meetings})", meetings)
    const sectionListData = [
            {
                title: "Meetings - Open",
                data: meetings,
                renderItem: 
                    (meeting) => {
                        console.log("meeting is ---", meeting)
                    return (<Text>{meeting.item.scheduledFor}</Text>)}
                },
        ];
    return (
        <View>
            <SectionList
                sections={sectionListData}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader={({section: {title}}) =>
                    <Text style={{fontWeight: 'bold'}}>{title}</Text>
                }
            />

        </View>
    )
}
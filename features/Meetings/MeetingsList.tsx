import { SectionList, Text, View } from "react-native";
import MeetingDisplay from "./MeetingDisplay";

export default function MeetingsList({meetings}) {

    const sectionListData = [
            {
                title: "Meetings - Open",
                data: meetings,
                renderItem: (meeting) => 
                        (<MeetingDisplay
                            meeting={meeting}
                        />)
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
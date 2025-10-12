import { useCreateMeetingMutation } from "@/services/meetingApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";


export default function MeetingCreator() {

    const [createMeeting] = useCreateMeetingMutation();
    const userId = useSelector((state) => state.auth.user.id);
    const [date, setDate] = useState(new Date());

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setDate(currentDate);
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => createMeeting({userFromId: userId})}
            >
                <Text>helloeeeq</Text>
                <View>
                    <Text>selected: {date.toLocaleString()}</Text>
                        <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={"datetime"}
                        onChange={onChange}
                        />
                    </View>
                    {/* <WebDateTimePicker/> */}
            </TouchableOpacity>
        </View>
    )
}







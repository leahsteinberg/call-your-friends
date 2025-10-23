import { useCreateMeetingMutation } from "@/services/meetingApi";
import { BURGUNDY } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSelector } from "react-redux";
import UnifiedDateTimePicker from "./UnifiedDateTimePicker";
import { displayDateTime } from "./meetingsUtils";

export default function MeetingCreator({refreshMeetings}: {refreshMeetings: () => void}) {
    const { height, width } = useWindowDimensions();
    const [createMeeting] = useCreateMeetingMutation();
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
    const [displayDateString, setDisplayDateString] = useState('');

    const handleDateTimeSelect = async (dateTime: Date) => {
        setSelectedDateTime(dateTime);
        const displayString = await displayDateTime(dateTime.toISOString());
        setDisplayDateString(displayString);
    };

    const handleCreateMeeting = () => {
        if (!selectedDateTime) {
            alert('Please select a date and time first');
            return;
        }

        const scheduledFor = selectedDateTime.toISOString();
        const scheduledEnd = new Date(selectedDateTime);
        scheduledEnd.setHours(scheduledEnd.getHours() + 1);
        
        createMeeting({
            userFromId: userId,
            scheduledFor,
            scheduledEnd: scheduledEnd.toISOString(),
        });
        refreshMeetings();
    };
    
    return (
        <View style={[styles.container]}>
            <Text style={styles.title}>Schedule a Meeting</Text>
            <UnifiedDateTimePicker 
                onDateTimeSelect={handleDateTimeSelect}
                selectedDateTime={selectedDateTime || undefined}
            />
            
            <TouchableOpacity 
                style={[styles.createButton, !selectedDateTime && styles.disabledButton]}
                onPress={handleCreateMeeting}
                disabled={!selectedDateTime}
            >
                <Text style={[styles.buttonText, !selectedDateTime && styles.disabledButtonText]}>
                    Create Meeting{displayDateString && ` for ${displayDateString}`}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: BURGUNDY,
        textAlign: 'center',
        marginBottom: 16,
    },
    createButton: {
        backgroundColor: BURGUNDY,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButtonText: {
        color: '#666',
    },
});



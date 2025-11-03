import { Check, Radar, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MeetingDisplayProps, MeetingState } from "./types";

export default function MeetingDisplay({ meeting }: MeetingDisplayProps) {
  const meetingState: MeetingState = meeting.item.meetingState;
  const iconSize: number = 24;
  console.log(meeting.item)
  
  const renderStateIcon = (): React.JSX.Element | null => {
    if (meetingState === 'SEARCHING') {
      return (<Radar style={styles.icon} color="yellow" size={iconSize}/>);
    } else if (meetingState === 'REJECTED') {
      return (<X style={styles.icon} color="red" size={iconSize}/>);
    } else if (meetingState === 'ACCEPTED') {
      return (<Check style={styles.icon} color="green" size={iconSize}/>);
    } else if (meetingState === 'PAST') {
      return (<X style={styles.icon} color="red" size={iconSize}/>);
    }
    return null;
  };

  return (<View style={styles.container} key={meeting.index}>
            <Text>{meeting.item.displayScheduledFor}</Text>
            {meeting.item.acceptedUser && meeting.item.acceptedUser.name &&
              <Text>with: {meeting.item.acceptedUser.name}</Text>
            }
            {renderStateIcon()}
        </View>
        );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  icon: {
    paddingRight: 10,
  }
});
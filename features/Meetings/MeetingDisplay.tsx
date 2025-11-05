import { BRIGHT_BLUE, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { Check, Radar, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MeetingDisplayProps, MeetingState } from "./types";

export default function MeetingDisplay({ meeting }: MeetingDisplayProps) {
  const meetingState: MeetingState = meeting.item.meetingState;
  const iconSize: number = 24;
  
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
            <Text style={styles.timeText}>{meeting.item.displayScheduledFor}</Text>
            {meeting.item.acceptedUser && meeting.item.acceptedUser.name &&
              <Text style={styles.nameText}>with: {meeting.item.acceptedUser.name}</Text>
            }
            {renderStateIcon()}
        </View>
        );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 15,
    backgroundColor: CREAM,
    borderWidth: 2,
    borderColor: DARK_BEIGE,

  },
  icon: {
    paddingRight: 10,
  },
  timeText: {
    color: BRIGHT_BLUE,
    fontWeight: 900,
    flexGrow: 1,
    paddingVertical: 10,
    paddingLeft: 5,
    
  },
  nameText: {
    color: ORANGE,
    fontWeight: 900,
    flexGrow: 1,
    paddingVertical: 10,
    paddingLeft: 5,

  },
});
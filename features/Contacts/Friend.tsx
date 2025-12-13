import { CustomFonts } from "@/constants/theme";
import { BRIGHT_BLUE, CHOCOLATE_COLOR, ORANGE, PALE_BLUE } from "@/styles/styles";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FriendProps } from "./types";

export default function Friend({ item }: FriendProps): React.JSX.Element {
  const [callIntent, setCallIntent] = useState<'none' | 'called' | 'nevermind'>('none');

  const handleCallIntent = () => {
    if (callIntent === 'none') {
      setCallIntent('called');
    } else if (callIntent === 'called') {
      setCallIntent('nevermind');
    } else {
      setCallIntent('none');
    }
  };

  const handleCallNow = () => {
    // TODO: Implement call now functionality
    console.log(`Calling ${item.name} at ${item.phoneNumber}`);
  };

  return (
    <View style={styles.container} key={item.index}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleCallNow} style={styles.callNowButton}>
            <Text style={styles.callNowText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleCallIntent}
        style={[
          styles.intentButton,
          callIntent !== 'none' && styles.intentButtonActive
        ]}
      >
        <Text style={[
          styles.intentButtonText,
          callIntent !== 'none' && styles.intentButtonTextActive
        ]}>
          {callIntent === 'none' ? 'Call Intent' :
           callIntent === 'called' ? 'Called' :
           'Never Mind'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: PALE_BLUE,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      marginHorizontal: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    name: {
      fontSize: 20,
      fontWeight: '600',
      color: ORANGE,
      fontFamily: CustomFonts.ztnaturebold,
      flexShrink: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    callNowButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    callNowText: {
      color: CHOCOLATE_COLOR,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: CustomFonts.ztnaturebold,
    },
    intentButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: BRIGHT_BLUE,
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    intentButtonActive: {
      backgroundColor: BRIGHT_BLUE,
    },
    intentButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: BRIGHT_BLUE,
      fontFamily: CustomFonts.ztnatureregular,
    },
    intentButtonTextActive: {
      color: PALE_BLUE,
    },
});
import { CustomFonts } from "@/constants/theme";
import { useCallIntentMutation, useUndoCallIntentMutation, useUserCalledMutation } from "@/services/contactsApi";
import { BRIGHT_BLUE, CHOCOLATE_COLOR, ORANGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { FriendProps } from "./types";

export default function Friend({ item }: FriendProps): React.JSX.Element {
  const userId = useSelector((state: RootState) => state.auth.user.id);

  const [showCallIntentActions, setShowCallIntentActions] = useState(item.isContactIntended);

  const [callIntent, { isLoading: isCallingIntent }] = useCallIntentMutation();
  const [undoCallIntent, { isLoading: isUndoing }] = useUndoCallIntentMutation();
  const [userCalled, { isLoading: isCalling }] = useUserCalledMutation();

  const handleCallIntent = async () => {
    try {
      await callIntent({ userId, userToId: item.id }).unwrap();
      setShowCallIntentActions(true);
    } catch (error) {
      console.error("Error setting call intent:", error);
      alert('Failed to set call intent. Please try again.');
    }
  };

  const handleNeverMind = async () => {
    try {
      await undoCallIntent({ userId, userToId: item.id }).unwrap();
      setShowCallIntentActions(false);
    } catch (error) {
      console.error("Error undoing call intent:", error);
      alert('Failed to undo call intent. Please try again.');
    }
  };

  const handleCalled = async () => {
    try {
      await userCalled({ userId, userToId: item.id }).unwrap();
      setShowCallIntentActions(false);
    } catch (error) {
      console.error("Error marking as called:", error);
      alert('Failed to mark as called. Please try again.');
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
        <Text>Intend-{item.isContactIntended.toString()}</Text>
        <Text>broadcast-{item.isBroadcasting.toString()}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleCallNow} style={styles.callNowButton}>
            <Text style={styles.callNowText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!showCallIntentActions ? (
        <TouchableOpacity
          onPress={handleCallIntent}
          style={styles.intentButton}
          disabled={isCallingIntent}
        >
          {isCallingIntent ? (
            <ActivityIndicator size="small" color={BRIGHT_BLUE} />
          ) : (
            <Text style={styles.intentButtonText}>Call Intent</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            onPress={handleCalled}
            style={[styles.actionButton, styles.calledButton]}
            disabled={isCalling}
          >
            {isCalling ? (
              <ActivityIndicator size="small" color={PALE_BLUE} />
            ) : (
              <Text style={styles.actionButtonTextActive}>Called</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNeverMind}
            style={[styles.actionButton, styles.neverMindButton]}
            disabled={isUndoing}
          >
            {isUndoing ? (
              <ActivityIndicator size="small" color={BRIGHT_BLUE} />
            ) : (
              <Text style={styles.intentButtonText}>Never Mind</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    intentButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: BRIGHT_BLUE,
      fontFamily: CustomFonts.ztnatureregular,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      flex: 1,
    },
    calledButton: {
      backgroundColor: BRIGHT_BLUE,
    },
    neverMindButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: BRIGHT_BLUE,
    },
    actionButtonTextActive: {
      fontSize: 14,
      fontWeight: '600',
      color: PALE_BLUE,
      fontFamily: CustomFonts.ztnatureregular,
    },
});
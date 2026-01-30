import TalkSoonButton from "@/components/CardActionDecorations/TalkSoonButton";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { useUserCalledMutation } from "@/services/contactsApi";
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BOLD_BLUE, BURGUNDY, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { CALL_INTENT_SIGNAL_TYPE, CallIntentPayload } from "@/types/userSignalsTypes";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { FriendProps } from "./types";

export default function Friend({ item, onCallIntentChange }: FriendProps): React.JSX.Element {
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const isBroadcasting = item.isBroadcastingToMe;
  const [showCallIntentActions, setShowCallIntentActions] = useState(item.hasOutgoingCallIntent ?? false);
  console.log("friend, item", item);
  const [addUserSignal, { isLoading: isCallingIntent }] = useAddUserSignalMutation();
  const [removeUserSignal, { isLoading: isUndoing }] = useRemoveUserSignalMutation();
  const [userCalled] = useUserCalledMutation();

  useEffect(() => {
    setShowCallIntentActions(item.hasOutgoingCallIntent ?? false);
  }, [item.hasOutgoingCallIntent]);

  const handleCallIntent = async () => {
    // Optimistic update
    setShowCallIntentActions(true);

    try {
      const payload: CallIntentPayload = { targetUserId: item.id };
      await addUserSignal({
        userId,
        type: CALL_INTENT_SIGNAL_TYPE,
        payload
      }).unwrap();

      // Refresh friends list to get updated state from backend
      onCallIntentChange?.();
    } catch (error) {
      // Rollback on error
      setShowCallIntentActions(false);
      console.error("Error setting call intent:", error);
      alert('Failed to set call intent. Please try again.');
    }
  };

  const handleNeverMind = async () => {
    // Optimistic update
    setShowCallIntentActions(false);

    try {
      if (item.outgoingCallIntentSignalId) {
        await removeUserSignal({ userId, signalId: item.outgoingCallIntentSignalId }).unwrap();
      }

      // Refresh friends list to get updated state from backend
      onCallIntentChange?.();
    } catch (error) {
      // Rollback on error
      setShowCallIntentActions(true);
      console.error("Error undoing call intent:", error);
      alert('Failed to undo call intent. Please try again.');
    }
  };

  const handleCalled = async () => {
    try {
      if (item.outgoingCallIntentSignalId) {
        await removeUserSignal({ userId, signalId: item.outgoingCallIntentSignalId }).unwrap();
      }
      await userCalled({ userId, userToId: item.id }).unwrap();
      onCallIntentChange?.();
    } catch (error) {
      console.error("Error marking as called:", error);
      alert('Failed to mark as called. Please try again.');
    }
  };

  const handleCallNow = () => {
    // TODO: Implement call now functionality
    console.log(`Calling ${item.name} at ${item.phoneNumber}`);
  };

  // Get first initial for avatar
  const firstInitial = item.name.charAt(0).toUpperCase();

  return (
    <View style={styles.outerContainer} key={item.index}>

      <View style={styles.container}>

        {/* Header with avatar, name, and call now button */}
        <View style={styles.header}>
          <View style={styles.leftSection}>
            {/* Avatar circle with first initial */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{firstInitial}</Text>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name}>{item.name}</Text>
              {isBroadcasting && (
                <Text style={styles.broadcastingText}>is broadcasting now</Text>
              )}
              {item.hasIncomingCallIntent &&
              <Text style={styles.broadcastingText}>---They want to call you!</Text>

              }
            </View>
          </View>

          {/* Call Now button - only when broadcasting */}
          {isBroadcasting && (
            <TouchableOpacity
              onPress={handleCallNow}
              style={styles.callNowButton}
            >
              <Text style={styles.callNowText}>Call Now</Text>
            </TouchableOpacity>
          )}
        <View style={styles.actionsSection}>
          <TalkSoonButton
            isActive={showCallIntentActions}
            onPress={handleCallIntent}
            onNeverMind={handleNeverMind}
            isLoading={isCallingIntent || isUndoing}
          />
        </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    outerContainer: {
      marginBottom: CARD_LOWER_MARGIN,
      position: 'relative',
      marginHorizontal: 10,
    },
    container: {
      backgroundColor: BOLD_BLUE,
      borderRadius: 20,
      padding: 18,
      overflow: 'hidden',
      minHeight: CARD_MIN_HEIGHT,
    },
    circleContainerRelative: {
      alignSelf: 'flex-start',
      marginTop: -110,
      marginLeft: -80,
      marginBottom: -30,
      zIndex: -1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      gap: 12,
    },
    avatarCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: CREAM,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: CORNFLOWER_BLUE,
    },
    avatarText: {
      fontSize: 20,
      fontWeight: '600',
      color: BOLD_BLUE,
      fontFamily: CustomFonts.ztnaturebold,
    },
    nameContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    name: {
      fontSize: 22,
      fontWeight: '600',
      color: CREAM,
      fontFamily: CustomFonts.ztnaturebold,
      marginBottom: 2,
    },
    broadcastingText: {
      fontSize: 14,
      color: CREAM,
      fontFamily: CustomFonts.ztnatureregular,
    },
    callNowButton: {
      backgroundColor: BURGUNDY,
      borderRadius: 15,
      paddingVertical: 8,
      paddingHorizontal: 14,
      minWidth: 70,
      alignItems: 'center',
    },
    callNowText: {
      color: PALE_BLUE,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: CustomFonts.ztnaturemedium,
    },
    actionsSection: {
      marginLeft: 'auto',
      justifyContent: 'center',
    },
});

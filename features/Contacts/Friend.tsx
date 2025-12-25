import CallIntentDecorator from "@/components/CallIntentDecorator";
import ConcentricCircles from "@/components/ConcentricCircles";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { useUserCalledMutation } from "@/services/contactsApi";
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BOLD_BLUE, BURGUNDY, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { CALL_INTENT_SIGNAL_TYPE, CallIntentPayload } from "@/types/userSignalsTypes";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { FriendProps } from "./types";

export default function Friend({ item }: FriendProps): React.JSX.Element {
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const isBroadcasting = item.isBroadcasting;
  const isContactIntended = item.isContactIntended;
  const [showCallIntentActions, setShowCallIntentActions] = useState(isContactIntended);

  const [addUserSignal, { isLoading: isCallingIntent }] = useAddUserSignalMutation();
  const [removeUserSignal, { isLoading: isUndoing }] = useRemoveUserSignalMutation();
  const [userCalled, { isLoading: isCalling }] = useUserCalledMutation();

  useEffect(() => {
    setShowCallIntentActions(item.isContactIntended)
  }, [item.isContactIntended]);

  const handleCallIntent = async () => {
    try {
      const payload: CallIntentPayload = { targetUserId: item.id };
      await addUserSignal({
        userId,
        type: CALL_INTENT_SIGNAL_TYPE,
        payload
      }).unwrap();
    } catch (error) {
      console.error("Error setting call intent:", error);
      alert('Failed to set call intent. Please try again.');
    }
  };

  const handleNeverMind = async () => {
    try {
      if (item.callIntentSignal) {
        await removeUserSignal({ userId, signalId: item.callIntentSignal.id }).unwrap();
      }
    } catch (error) {
      console.error("Error undoing call intent:", error);
      alert('Failed to undo call intent. Please try again.');
    }
  };

  const handleCalled = async () => {
    try {
      if (item.callIntentSignal) {
        await removeUserSignal({ userId, signalId: item.callIntentSignal.id }).unwrap();
      }
      await userCalled({ userId, userToId: item.id }).unwrap();
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
      {/* "remind me" Decorator - only when call intent is active */}
      <CallIntentDecorator
        isVisible={isContactIntended}
        onNeverMind={handleNeverMind}
        isLoading={isUndoing}
      />

      <View style={styles.container}>
        {/* Concentric circles animation for broadcasting */}
        {isBroadcasting && (
          <View style={styles.circleContainerRelative}>
            <ConcentricCircles isActive={true} primaryColor={BOLD_BLUE} secondaryColor={CREAM} />
          </View>
        )}

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
                  {/* "Will Call Soon" chip - only show when NOT in call intent mode */}
        {!showCallIntentActions && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              onPress={handleCallIntent}
              style={styles.willCallSoonChip}
              disabled={isCallingIntent}
            >
              {isCallingIntent ? (
                <ActivityIndicator size="small" color={CORNFLOWER_BLUE} />
              ) : (
                <Text style={styles.willCallSoonText}>Will Call Soon</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        </View>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    outerContainer: {
      marginBottom: CARD_LOWER_MARGIN,
      position: 'relative', // Enable absolute positioning for decorator
      marginHorizontal: 10,
    },
    container: {
      backgroundColor: BOLD_BLUE,
      borderRadius: 8,
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
      color: CORNFLOWER_BLUE,
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
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    willCallSoonChip: {
      backgroundColor: CORNFLOWER_BLUE,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignSelf: 'flex-start',
    },
    willCallSoonText: {
      fontSize: 13,
      fontWeight: '600',
      color: CREAM,
      fontFamily: CustomFonts.ztnaturemedium,
    },
});
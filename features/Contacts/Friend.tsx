import Avatar from "@/components/Avatar/Avatar";
import TalkSoonButton from "@/components/CardActionDecorations/TalkSoonButton";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { useUserCalledMutation } from "@/services/contactsApi";
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BURGUNDY, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { CALL_INTENT_SIGNAL_TYPE, CallIntentPayload } from "@/types/userSignalsTypes";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import { FriendProps } from "./types";

// Neumorphic styling constants (matching EventCard)
const NEUMORPHIC = {
  lightShadow: CREAM,
  darkShadow: 'rgba(0, 0, 0, 0.25)',
  backgroundTint: 'rgba(0, 0, 0, 0.08)',
  borderColor: 'rgba(255, 255, 255, 0.15)',
  shadowOffset: 4,
  shadowBlur: 8,
};

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

  // Green dot animation for broadcasting
  const dotScale = useSharedValue(1);

  useEffect(() => {
    if (isBroadcasting) {
      dotScale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, false
      );
    } else {
      dotScale.value = withTiming(1, { duration: 300 });
    }
  }, [isBroadcasting]);

  const greenDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View style={styles.outerContainer} key={item.index}>
      <View style={styles.container}>

        {/* Header with avatar, name, and call now button */}
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <Avatar name={item.name} avatarUrl={item.avatarUrl} size={48}>
              <Avatar.PulseRing active={!!isBroadcasting} />
            </Avatar>

            <View style={styles.nameContainer}>
              <Text style={styles.name}>{item.name}</Text>
              {/* {isBroadcasting && (
                <View style={styles.broadcastingRow}>
                  <Animated.View style={[styles.greenDot, greenDotStyle]} />
                  <Text style={styles.wantsCallsText}>{item.name} wants calls</Text>
                </View>
              )} */}
              {item.hasIncomingCallIntent &&
                <Text style={styles.broadcastingText}>They want to call you!</Text>
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
      backgroundColor: CREAM,//'rgba(30, 60, 114, 0.75)',
      borderRadius: 20,
      padding: 18,
      overflow: 'visible',
      minHeight: CARD_MIN_HEIGHT,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
      ...Platform.select({
        ios: {
          shadowColor: NEUMORPHIC.darkShadow,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 10,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: `-${NEUMORPHIC.shadowOffset}px -${NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowBlur}px ${NEUMORPHIC.lightShadow}, ${NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowBlur * 1.5}px ${NEUMORPHIC.darkShadow}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
      }),
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
    nameContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    name: {
      fontSize: 22,
      fontWeight: '600',
      color: 'black',
      fontFamily: CustomFonts.ztnaturebold,
      marginBottom: 2,
    },
    broadcastingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    wantsCallsText: {
      fontSize: 13,
      color: '#7bed7b',
      fontFamily: CustomFonts.ztnaturemedium,
    },
    greenDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#7bed7b',
    },
    broadcastingText: {
      fontSize: 14,
      color: 'black',
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
    },
});

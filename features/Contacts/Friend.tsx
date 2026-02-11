import TalkSoonButton from "@/components/CardActionDecorations/TalkSoonButton";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { useUserCalledMutation } from "@/services/contactsApi";
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BOLD_BLUE, BURGUNDY, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { CALL_INTENT_SIGNAL_TYPE, CallIntentPayload } from "@/types/userSignalsTypes";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
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

  // Get first initial for avatar
  const firstInitial = item.name.charAt(0).toUpperCase();

  // Pulse animation for broadcasting avatar
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const dotScale = useSharedValue(1);

  useEffect(() => {
    if (isBroadcasting) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.35, { duration: 1600, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 50 }),
          withTiming(1, { duration: 400 }),
        ),
        -1, false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 50 }),
          withTiming(0, { duration: 1550, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: 50 }),
          withTiming(0, { duration: 400 }),
        ),
        -1, false
      );
      dotScale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      pulseOpacity.value = withTiming(0, { duration: 300 });
      dotScale.value = withTiming(1, { duration: 300 });
    }
  }, [isBroadcasting]);

  const avatarPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const greenDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View style={styles.outerContainer} key={item.index}>
      <View style={styles.container}>

        {/* Header with avatar, name, and call now button */}
        <View style={styles.header}>
          <View style={styles.leftSection}>
            {/* Avatar circle with pulse ring when broadcasting */}
            <View style={styles.avatarWrapper}>
              {isBroadcasting && (
                <Animated.View style={[styles.avatarPulseRing, avatarPulseStyle]} />
              )}
              <View style={styles.avatarCircle}>
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    transition={200}
                    recyclingKey={item.id}
                  />
                ) : (
                  <Text style={styles.avatarText}>{firstInitial}</Text>
                )}
              </View>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name}>{item.name}</Text>
              {isBroadcasting && (
                <View style={styles.broadcastingRow}>
                  <Animated.View style={[styles.greenDot, greenDotStyle]} />
                  <Text style={styles.wantsCallsText}>{item.name} wants calls</Text>
                </View>
              )}
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
    avatarWrapper: {
      position: 'relative',
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarPulseRing: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.3)',
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
      overflow: 'hidden',
    },
    avatarImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
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
      backgroundColor: 'red',
      //marginLeft: 'auto',
      justifyContent: 'end',
    },
});

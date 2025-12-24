import ConcentricCircles from "@/components/ConcentricCircles";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { useUserCalledMutation } from "@/services/contactsApi";
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BOLD_BLUE, BOLD_BROWN, BURGUNDY, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { CALL_INTENT_SIGNAL_TYPE, CallIntentPayload } from "@/types/userSignalsTypes";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSelector } from "react-redux";
import { FriendProps } from "./types";

export default function Friend({ item }: FriendProps): React.JSX.Element {
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const isBroadcasting = item.isBroadcasting;
  const isContactIntended = item.isContactIntended;
  const [showCallIntentActions, setShowCallIntentActions] = useState(isContactIntended);
  const [showNeverMindModal, setShowNeverMindModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const decoratorRef = useRef<View>(null);

  const [addUserSignal, { isLoading: isCallingIntent }] = useAddUserSignalMutation();
  const [removeUserSignal, { isLoading: isUndoing }] = useRemoveUserSignalMutation();
  const [userCalled, { isLoading: isCalling }] = useUserCalledMutation();

  // Animation values for modal
  const modalTranslateY = useSharedValue(20);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    setShowCallIntentActions(item.isContactIntended)
  }, [item.isContactIntended])

  // Trigger animation when modal appears
  useEffect(() => {
    if (showNeverMindModal) {
      modalTranslateY.value = 20;
      modalOpacity.value = 0;

      modalTranslateY.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
      modalOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.linear,
      });
    }
  }, [showNeverMindModal]);

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
      setShowNeverMindModal(false); // Close modal first
      if (item.callIntentSignal) {
        await removeUserSignal({ userId, signalId: item.callIntentSignal.id }).unwrap();
      }
    } catch (error) {
      console.error("Error undoing call intent:", error);
      alert('Failed to undo call intent. Please try again.');
    }
  };

  // Handle tapping the "remind me" decorator to show modal
  const handleDecoratorPress = () => {
    decoratorRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // Position modal near the decorator
      setModalPosition({
        x: pageX + width / 2,
        y: pageY + height + 8, // 8px below the decorator
      });
      setShowNeverMindModal(true);
    });
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

  // Create animated style for modal
  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
    opacity: modalOpacity.value,
  }));

  return (
    <>
      <View style={styles.outerContainer} key={item.index}>
        {/* "remind me" Decorator - TapbackDecoration style, only when call intent is active */}
        {isContactIntended && (
          <TouchableOpacity
            ref={decoratorRef}
            style={styles.callIntentDecorator}
            onPress={handleDecoratorPress}
            activeOpacity={0.7}
          >
            <Text style={styles.decoratorText}>remind me</Text>
          </TouchableOpacity>
        )}

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
          </View>

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

      {/* Never Mind Modal - appears when tapping "remind me" decorator */}
      <Modal
        visible={showNeverMindModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowNeverMindModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowNeverMindModal(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.neverMindModalContainer,
                {
                  position: 'absolute',
                  left: modalPosition.x - 60, // Center the modal (120px width / 2)
                  top: modalPosition.y,
                },
                animatedModalStyle,
              ]}
            >
              <TouchableOpacity
                style={styles.neverMindModalButton}
                onPress={handleNeverMind}
                disabled={isUndoing}
                activeOpacity={0.7}
              >
                {isUndoing ? (
                  <ActivityIndicator size="small" color={BURGUNDY} />
                ) : (
                  <Text style={styles.neverMindModalText}>Never Mind</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    callIntentDecorator: {
      position: 'absolute',
      top: -10,
      right: -10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: CREAM,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 10,
      borderWidth: 2,
      borderColor: BOLD_BLUE,
    },
    decoratorText: {
      fontSize: 12,
      fontWeight: '600',
      color: BOLD_BLUE,
      fontFamily: CustomFonts.ztnaturemedium,
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
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    neverMindModalContainer: {
      backgroundColor: CREAM,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    neverMindModalButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 32,
    },
    neverMindModalText: {
      fontSize: 14,
      fontWeight: '600',
      color: BURGUNDY,
      fontFamily: CustomFonts.ztnaturemedium,
    },
});
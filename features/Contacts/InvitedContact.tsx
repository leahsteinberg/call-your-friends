import { CustomFonts } from "@/constants/theme";
import { useRemoveInviteMutation } from "@/services/contactsApi";
import { BOLD_BLUE, BRIGHT_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useRef } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import { removeSentInvite } from "./contactsSlice";
import { InvitedContactProps } from "./types";

// Neumorphic styling constants (matching EventCard)
const NEUMORPHIC = {
  lightShadow: CREAM,
  darkShadow: 'rgba(0, 0, 0, 0.25)',
  backgroundTint: 'rgba(0, 0, 0, 0.08)',
  borderColor: 'rgba(255, 255, 255, 0.15)',
  shadowOffset: 4,
  shadowBlur: 8,
};

export default function InvitedContact({ contact }: InvitedContactProps): React.JSX.Element {
  const dispatch = useDispatch();
  const [removeInvite] = useRemoveInviteMutation();
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = async () => {
    const inviteId = contact.item.id;

    // Optimistic deletion - remove from UI immediately
    dispatch(removeSentInvite(inviteId));

    try {
      await removeInvite({ inviteId }).unwrap();
    } catch (error) {
      console.error("Failed to remove invite:", error);
      // Note: In a production app, you might want to restore the item on failure
      // and show an error message to the user
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.deleteIconContainer, { transform: [{ scale }] }]}>
          <IconSymbol name="trash" size={24} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const onSwipeableOpen = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      handleDelete();
    }
  };

  return (
    <View style={styles.swipeableWrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={onSwipeableOpen}
        rightThreshold={80}
        overshootRight={false}
      >
        <View style={styles.container} key={contact.index}>
          <View style={styles.header}>
            <Text style={styles.mainText}>Waiting for friend ({contact.item.userToPhoneNumber})</Text>
          </View>
          <Text style={styles.subtitle}>Invited {displayTimeDifference(contact.item.createdAt)}</Text>
        </View>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeableWrapper: {
    marginHorizontal: 10,
    marginBottom: 12,
    position: 'relative',
  },
  container: {
    backgroundColor: 'rgba(200, 215, 235, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    marginBottom: 4,
  },
  mainText: {
    fontSize: 18,
    fontWeight: '600',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnaturebold,
  },
  subtitle: {
    fontSize: 14,
    color: BRIGHT_BLUE,
    fontFamily: CustomFonts.ztnatureregular,
  },
  deleteAction: {
    backgroundColor: '#DC3545',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

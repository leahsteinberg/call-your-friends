import { BOLD_BLUE, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { CustomFonts } from "@/constants/theme";
import type { Friend } from "@/features/Contacts/types";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

interface FriendBadgeSelectorProps {
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

/**
 * FriendBadgeSelector - Badge that expands into friend selector
 *
 * Displays a "friends" badge that opens a modal with a list of friends when tapped.
 * The modal "fans out" from the badge position.
 *
 * Usage:
 * ```tsx
 * <FriendBadgeSelector
 *   friends={friendsList}
 *   onSelectFriend={(friend) => console.log('Selected:', friend.name)}
 *   position="bottom-left"
 * />
 * ```
 */
export default function FriendBadgeSelector({
  friends,
  onSelectFriend,
  position = 'bottom-left'
}: FriendBadgeSelectorProps): React.JSX.Element {
  const [showSelector, setShowSelector] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const badgeRef = useRef<View>(null);

  // Animation values for modal
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  // Trigger animation when modal appears
  useEffect(() => {
    if (showSelector) {
      modalScale.value = 0.8;
      modalOpacity.value = 0;

      // Fan out animation - scale up with spring
      modalScale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });
      modalOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [showSelector]);

  // Handle tapping the badge to show selector
  const handleBadgePress = () => {
    badgeRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // Position modal based on badge position
      const isBottom = position.includes('bottom');
      const isLeft = position.includes('left');

      setSelectorPosition({
        x: isLeft ? pageX : pageX - 180 + width, // Align left or right edge
        y: isBottom ? pageY - 220 : pageY + height + 8, // Above or below badge
      });
      setShowSelector(true);
    });
  };

  // Handle friend selection
  const handleFriendSelect = (friend: Friend) => {
    onSelectFriend(friend);
    setShowSelector(false);
  };

  // Create animated style for modal
  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  // Get position styles for badge
  const getBadgePositionStyle = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 10, left: 10 };
      case 'bottom-right':
        return { bottom: 10, right: 10 };
      case 'top-left':
        return { top: 10, left: 10 };
      case 'top-right':
        return { top: 10, right: 10 };
      default:
        return { bottom: 10, left: 10 };
    }
  };

  return (
    <>
      {/* "friends" Badge */}
      <TouchableOpacity
        ref={badgeRef}
        style={[styles.friendsBadge, getBadgePositionStyle()]}
        onPress={handleBadgePress}
        activeOpacity={0.7}
      >
        <Text style={styles.badgeText}>friends</Text>
      </TouchableOpacity>

      {/* Friend Selector Modal */}
      <Modal
        visible={showSelector}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowSelector(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSelector(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.selectorContainer,
                {
                  position: 'absolute',
                  left: selectorPosition.x,
                  top: selectorPosition.y,
                },
                animatedModalStyle,
              ]}
            >
              <Text style={styles.selectorTitle}>Select a friend</Text>
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.friendItem}
                    onPress={() => handleFriendSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.friendName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                style={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  friendsBadge: {
    position: 'absolute',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CORNFLOWER_BLUE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: CREAM,
    fontFamily: CustomFonts.ztnaturemedium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  selectorContainer: {
    width: 200,
    maxHeight: 280,
    backgroundColor: CREAM,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnaturebold,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  friendsList: {
    flexGrow: 0,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALE_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: CORNFLOWER_BLUE,
  },
  friendAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnaturebold,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '500',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnatureregular,
    flex: 1,
  },
});

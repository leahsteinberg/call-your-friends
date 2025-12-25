import { CustomFonts } from "@/constants/theme";
import type { Friend } from "@/features/Contacts/types";
import { BOLD_BLUE, BOLD_GREEN, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

interface FriendBadgeSelectorProps {
  friends: Friend[];
  onSelectFriends: (userIds: string[]) => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'below-left';
}

/**
 * FriendBadgeSelector - Badge that expands into multi-select friend selector
 *
 * Displays a "friends" badge that opens a modal with a list of friends when tapped.
 * Users can select multiple friends using checkboxes, then tap "Select" to confirm.
 *
 * Usage:
 * ```tsx
 * <FriendBadgeSelector
 *   friends={friendsList}
 *   onSelectFriends={(userIds) => console.log('Selected IDs:', userIds)}
 *   position="bottom-left"
 * />
 * ```
 */
export default function FriendBadgeSelector({
  friends,
  onSelectFriends,
  position = 'below-left'
}: FriendBadgeSelectorProps): React.JSX.Element {
  const [showSelector, setShowSelector] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
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
      const isBottom = position.includes('bottom') || position.includes('below');
      const isLeft = position.includes('left');

      setSelectorPosition({
        x: isLeft ? pageX : pageX - 180 + width, // Align left or right edge
        y: isBottom ? pageY + height + 8 : pageY - 220, // Below or above badge
      });
      setShowSelector(true);
    });
  };

  // Toggle friend selection
  const handleToggleFriend = (userId: string) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        // Deselect - remove from array
        return prev.filter(id => id !== userId);
      } else {
        // Select - add to array
        return [...prev, userId];
      }
    });
  };

  // Confirm selection and close modal
  const handleConfirmSelection = () => {
    onSelectFriends(selectedUserIds);
    setShowSelector(false);
    setSelectedUserIds([]); // Reset selection for next time
  };

  // Create animated style for modal
  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  // Get position styles for badge
  const getBadgePositionStyle = () => {
    switch (position) {
      case 'below-left':
        return { marginTop: 8, alignSelf: 'flex-start' as const };
      case 'bottom-left':
        return { bottom: 10, left: 10 };
      case 'bottom-right':
        return { bottom: 10, right: 10 };
      case 'top-left':
        return { top: 10, left: 10 };
      case 'top-right':
        return { top: 10, right: 10 };
      default:
        return { marginTop: 8, alignSelf: 'flex-start' as const };
    }
  };

  const isAbsolutePosition = position !== 'below-left';

  // Don't show the badge if there are no friends loaded
  if (!friends || friends.length === 0) {
    return null;
  }

  return friends.length > 0 ?
  
  (
    <>
      {/* "friends" Badge */}
      <TouchableOpacity
        ref={badgeRef}
        style={[
          isAbsolutePosition ? styles.friendsBadge : styles.friendsBadgeRelative,
          getBadgePositionStyle()
        ]}
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
              {/* Select button at the top */}
              <TouchableOpacity
                style={styles.selectButton}
                onPress={handleConfirmSelection}
                activeOpacity={0.7}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>

              {/* Friend list with checkboxes */}
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedUserIds.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={styles.friendItem}
                      onPress={() => handleToggleFriend(item.id)}
                      activeOpacity={0.7}
                    >
                      {/* Checkbox circle */}
                      <View style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected
                      ]}>
                        {isSelected && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>

                      {/* Avatar */}
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      {/* Name */}
                      <Text style={styles.friendName}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                }}
                style={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  ) : <View/>;
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
  friendsBadgeRelative: {
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
  selectButton: {
    backgroundColor: BOLD_GREEN,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: CREAM,
    fontFamily: CustomFonts.ztnaturebold,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BOLD_BLUE,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: BOLD_GREEN,
    borderColor: BOLD_GREEN,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: CREAM,
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

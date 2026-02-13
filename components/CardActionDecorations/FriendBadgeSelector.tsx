import { CustomFonts } from "@/constants/theme";
import type { Friend } from "@/features/Contacts/types";
import { BOLD_BLUE, BURGUNDY, CORNFLOWER_BLUE, CREAM, FUN_PINK, PALE_BLUE } from "@/styles/styles";
import { Image } from "expo-image";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AddFriendsIcon from "./AddFriendsIcon";
import StackedFriendAvatars from "./StackedFriendAvatars";

interface FriendBadgeSelectorProps {
  friends: Friend[];
  onSelectFriends: (userIds: string[]) => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'below-left';
  selectedFriendIds?: string[];
}

export interface FriendBadgeSelectorRef {
  openSelector: () => void;
}

/**
 * FriendBadgeSelector - Badge that expands into multi-select friend selector
 *
 * Displays a "friends" badge that opens a modal with a list of friends when tapped.
 * Users can select multiple friends using checkboxes, then tap "Select" to confirm.
 * When friends are selected, shows stacked avatars instead of badge.
 *
 * Usage:
 * ```tsx
 * <FriendBadgeSelector
 *   friends={friendsList}
 *   onSelectFriends={(userIds) => console.log('Selected IDs:', userIds)}
 *   position="bottom-left"
 *   selectedFriendIds={['id1', 'id2']}
 * />
 * ```
 */
const FriendBadgeSelector = forwardRef<FriendBadgeSelectorRef, FriendBadgeSelectorProps>(({
  friends,
  onSelectFriends,
  position = 'below-left',
  selectedFriendIds = []
}, ref) => {
  const [showSelector, setShowSelector] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const badgeRef = useRef<View>(null);

  // Animation values for modal
  const modalScale = useSharedValue(0.1);
  const modalOpacity = useSharedValue(0);

  // Trigger animation when modal appears or disappears
  useEffect(() => {
    if (showSelector) {
      setModalVisible(true);
      modalScale.value = 0.8;
      modalOpacity.value = 0;

      // Fan out animation - scale up with ease-in-out curve
      modalScale.value = withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      modalOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      });
    } else if (modalVisible) {
      // Close animation - scale down with ease-in-out curve
      modalScale.value = withTiming(0.8, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      modalOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });

      // Hide modal after animation completes
      setTimeout(() => {
        setModalVisible(false);
      }, 300);
    }
  }, [showSelector]);

  // Handle tapping the badge to show selector
  const handleBadgePress = () => {
    // Pre-populate with currently selected friends
    setSelectedUserIds(selectedFriendIds);

    badgeRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // Position modal based on badge position
      const isBottom = position.includes('bottom') || position.includes('below');
      const isLeft = position.includes('left');

      setSelectorPosition({
        x: isLeft ? pageX : pageX - 180 + width, // Align left or right edge
        y: isBottom ? pageY + height - 4 : pageY - 220, // Increased offset to avoid overlap
      });
      setShowSelector(true);
    });
  };

  // Close modal (avatars will automatically collapse)
  const handleCloseModal = () => {
    setShowSelector(false);
  };

  // Expose openSelector method to parent via ref
  useImperativeHandle(ref, () => ({
    openSelector: handleBadgePress
  }));

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
    handleCloseModal();
    setSelectedUserIds([]); // Reset selection for next time
  };

  // Create animated style for modal
  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const getButtonText = () => {
    const friendCount = selectedFriends.length;
    return friendCount === 0 ? `Share with all friends`
      : (friendCount === 1 ? `Share with ${selectedFriends[0].name}` : `Share with ${friendCount} friends`);
  }

  // Get position styles for badge
  const getBadgePositionStyle = () => {
    switch (position) {
      case 'below-left':
        return { marginTop: 8, alignSelf: 'flex-start' as const };
      case 'bottom-left':
        return { bottom: 10, left: 10 };
      case 'bottom-right':
        return { bottom: 0, right: 20 };
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

  // Determine whether to show badge or stacked avatars
  const showStackedAvatars = selectedFriendIds.length > 0;

  // Filter to get selected friend objects
  const selectedFriends = friends.filter(friend =>
    selectedFriendIds.includes(friend.id)
  );

  return friends.length > 0 ?

  (
    <>
      {/* Container for badge or stacked avatars - always rendered for ref positioning */}
      <TouchableOpacity
        ref={badgeRef}
        style={[
          isAbsolutePosition ? styles.container : styles.containerRelative,
          getBadgePositionStyle(),
        ]}
        onPress={handleBadgePress}
        activeOpacity={0.7}
      >
          <View style={styles.badgeWithAvatars}>
            {showStackedAvatars ? (
              <StackedFriendAvatars
                selectedFriends={selectedFriends}
                expanded={showSelector}
              />
            ) : (
              <AddFriendsIcon />
            )}
          </View>
      </TouchableOpacity>

      {/* Friend Selector Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
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
                style={[styles.selectButton]}
                onPress={handleConfirmSelection}
                activeOpacity={0.7}
                //disabled={(selectedUserIds.length === 0)}
              >
                <Text style={styles.selectButtonText}>{(selectedUserIds.length === 0) ? `Select All Friends` : `Select`}</Text>
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
                        {item.avatarUrl ? (
                          <Image
                            source={{ uri: item.avatarUrl }}
                            style={styles.friendAvatarImage}
                            contentFit="cover"
                            transition={200}
                            recyclingKey={item.id}
                          />
                        ) : (
                          <Text style={styles.friendAvatarText}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        )}
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
});

export default FriendBadgeSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: FUN_PINK,
    //: 'absolute',
    //zIndex: 10,
  },
  containerRelative: {
    // No position styling for relative layout
  },
  badgeWithAvatars: {
    alignItems: 'flex-end', // Align children to the right
    marginRight: 10,
    marginBottom: 10,
  },
  friendsBadge: {
    //paddingHorizontal: 14,
    //paddingVertical: 8,
    //borderRadius: 20,
    //backgroundColor: CREAM,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: BURGUNDY,
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
    backgroundColor: BURGUNDY,
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
    borderColor: BURGUNDY,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: BOLD_BLUE,
    borderColor: BOLD_BLUE,
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
    overflow: 'hidden',
  },
  friendAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
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

import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import type { Friend } from "@/features/Friends/types";
import type { Group } from "@/services/groupsApi";
import { BOLD_BLUE, BURGUNDY, CORNFLOWER_BLUE, CREAM, FUN_PURPLE, PALE_BLUE } from "@/styles/styles";
import { Image } from "expo-image";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AddFriendsIcon from "./AddFriendsIcon";
import StackedFriendAvatars from "./StackedFriendAvatars";
import StackedGroupAvatar from "./StackedGroupAvatar";

interface FriendBadgeSelectorProps {
  friends: Friend[];
  groups?: Group[];
  onSelectFriends: (userIds: string[]) => void;
  onSelectGroup?: (groupId: string | null) => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'below-left';
  selectedFriendIds?: string[];
  selectedGroupId?: string | null;
}

export interface FriendBadgeSelectorRef {
  openSelector: () => void;
}

const MAX_COMPACT_GROUPS = 3;

// ─── Full-screen selector (Instagram-style) ───────────────────────────────────

interface FullSelectorProps {
  visible: boolean;
  friends: Friend[];
  groups: Group[];
  selectedFriendIds: string[];
  selectedGroupId: string | null;
  onToggleFriend: (id: string) => void;
  onSelectGroup: (id: string | null) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function FullSelector({
  visible, friends, groups, selectedFriendIds, selectedGroupId,
  onToggleFriend, onSelectGroup, onConfirm, onClose,
}: FullSelectorProps) {
  const sections = [
    ...(groups.length > 0 ? [{
      key: 'groups',
      title: 'Groups',
      data: groups.map(g => ({ type: 'group' as const, id: g.id, name: g.name, memberCount: g.members.length })),
    }] : []),
    ...(friends.length > 0 ? [{
      key: 'friends',
      title: 'Friends',
      data: friends.map(f => ({ type: 'friend' as const, id: f.id, name: f.name, avatarUrl: f.avatarUrl })),
    }] : []),
  ];

  const selectionCount = selectedGroupId ? 1 : selectedFriendIds.length;
  const confirmLabel = selectedGroupId
    ? `Done`
    : selectionCount === 0 ? 'Done' : `Done (${selectionCount})`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={fullStyles.root}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={fullStyles.header}>
          <TouchableOpacity onPress={onClose} style={fullStyles.headerBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol name="xmark" size={18} color="#000" />
          </TouchableOpacity>
          <Text style={fullStyles.headerTitle}>Select people</Text>
          <TouchableOpacity onPress={onConfirm} style={fullStyles.headerDone} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={fullStyles.headerDoneText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <SectionList
          sections={sections as any}
          keyExtractor={(item: any) => item.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }: any) => (
            <View style={fullStyles.sectionHeader}>
              <Text style={fullStyles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }: any) => {
            if (item.type === 'group') {
              const isSelected = selectedGroupId === item.id;
              return (
                <TouchableOpacity
                  style={fullStyles.row}
                  onPress={() => onSelectGroup(isSelected ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <View style={fullStyles.groupIconWrap}>
                    <IconSymbol name="person.2.fill" size={18} color={FUN_PURPLE} />
                  </View>
                  <View style={fullStyles.rowContent}>
                    <Text style={fullStyles.rowName}>{item.name}</Text>
                    <Text style={fullStyles.rowSub}>{item.memberCount} members</Text>
                  </View>
                  <View style={[fullStyles.selectionCircle, isSelected && fullStyles.selectionCircleFilled]}>
                    {isSelected && <IconSymbol name="checkmark" size={12} color={CREAM} />}
                  </View>
                </TouchableOpacity>
              );
            }
            // friend
            const isSelected = selectedFriendIds.includes(item.id);
            return (
              <TouchableOpacity
                style={fullStyles.row}
                onPress={() => onToggleFriend(item.id)}
                activeOpacity={0.7}
              >
                <View style={fullStyles.avatarWrap}>
                  {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={fullStyles.avatarImg} contentFit="cover" recyclingKey={item.id} />
                  ) : (
                    <Text style={fullStyles.avatarInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <View style={fullStyles.rowContent}>
                  <Text style={fullStyles.rowName}>{item.name}</Text>
                </View>
                <View style={[fullStyles.selectionCircle, isSelected && fullStyles.selectionCircleFilled]}>
                  {isSelected && <IconSymbol name="checkmark" size={12} color={CREAM} />}
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={fullStyles.listContent}
          ItemSeparatorComponent={() => <View style={fullStyles.separator} />}
        />
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const FriendBadgeSelector = forwardRef<FriendBadgeSelectorRef, FriendBadgeSelectorProps>(({
  friends,
  groups = [],
  onSelectFriends,
  onSelectGroup,
  position = 'below-left',
  selectedFriendIds = [],
  selectedGroupId = null,
}, ref) => {
  const [showSelector, setShowSelector] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showFullSelector, setShowFullSelector] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [localGroupId, setLocalGroupId] = useState<string | null>(null);
  const badgeRef = useRef<View>(null);

  const modalScale = useSharedValue(0.1);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (showSelector) {
      setModalVisible(true);
      modalScale.value = 0.8;
      modalOpacity.value = 0;
      modalScale.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) });
      modalOpacity.value = withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) });
    } else if (modalVisible) {
      modalScale.value = withTiming(0.8, { duration: 300, easing: Easing.inOut(Easing.ease) });
      modalOpacity.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) });
      setTimeout(() => setModalVisible(false), 300);
    }
  }, [showSelector]);

  const handleBadgePress = () => {
    setSelectedUserIds(selectedFriendIds);
    setLocalGroupId(selectedGroupId);
    badgeRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const isBottom = position.includes('bottom') || position.includes('below');
      const isLeft = position.includes('left');
      setSelectorPosition({
        x: isLeft ? pageX : pageX - 200 + width,
        y: isBottom ? pageY + height - 4 : pageY - 220,
      });
      setShowSelector(true);
    });
  };

  const handleCloseModal = () => setShowSelector(false);

  useImperativeHandle(ref, () => ({ openSelector: handleBadgePress }));

  // Toggle friend — clears any group selection
  const handleToggleFriend = (userId: string) => {
    setLocalGroupId(null);
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Select group — clears individual friends
  const handleSelectGroup = (groupId: string | null) => {
    setSelectedUserIds([]);
    setLocalGroupId(groupId);
  };

  const handleConfirmSelection = () => {
    onSelectFriends(localGroupId ? [] : selectedUserIds);
    onSelectGroup?.(localGroupId);
    handleCloseModal();
    setSelectedUserIds([]);
    setLocalGroupId(null);
  };

  const handleOpenFull = () => {
    // Close compact first, then open full selector
    setShowSelector(false);
    setTimeout(() => setShowFullSelector(true), 320);
  };

  const handleFullConfirm = () => {
    onSelectFriends(localGroupId ? [] : selectedUserIds);
    onSelectGroup?.(localGroupId);
    setShowFullSelector(false);
  };

  const handleFullClose = () => {
    // Revert local state to props on cancel
    setSelectedUserIds(selectedFriendIds);
    setLocalGroupId(selectedGroupId);
    setShowFullSelector(false);
  };

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const getButtonText = () => {
    if (localGroupId) {
      const group = groups.find(g => g.id === localGroupId);
      return group ? `Share with ${group.name}` : 'Select';
    }
    const count = selectedUserIds.length;
    return count === 0 ? 'Share with all friends'
      : count === 1 ? `Share with ${friends.find(f => f.id === selectedUserIds[0])?.name ?? '1 friend'}`
      : `Share with ${count} friends`;
  };

  const getBadgePositionStyle = () => {
    switch (position) {
      case 'below-left': return { marginTop: 8, alignSelf: 'flex-start' as const };
      case 'bottom-left': return { bottom: 10, left: 10 };
      case 'bottom-right': return { bottom: 0, right: 20 };
      case 'top-left': return { top: 10, left: 10 };
      case 'top-right': return { top: 10, right: 10 };
      default: return { marginTop: 8, alignSelf: 'flex-start' as const };
    }
  };

  const isAbsolutePosition = position !== 'below-left';

  if (!friends || friends.length === 0) return null;

  const selectedFriends = friends.filter(f => selectedFriendIds.includes(f.id));
  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;
  const compactGroups = groups.slice(0, MAX_COMPACT_GROUPS);
  const hasMoreToShow = groups.length > MAX_COMPACT_GROUPS || friends.length > 0;

  // Determine what to show in the badge
  const renderBadgeContent = () => {
    if (selectedGroup) {
      return <StackedGroupAvatar group={selectedGroup} />;
    }
    if (selectedFriends.length > 0) {
      return <StackedFriendAvatars selectedFriends={selectedFriends} expanded={showSelector} />;
    }
    return <AddFriendsIcon />;
  };

  return (
    <>
      {/* Trigger badge */}
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
          {renderBadgeContent()}
        </View>
      </TouchableOpacity>

      {/* Compact dropdown modal */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleCloseModal}>
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.selectorContainer,
                { position: 'absolute', left: selectorPosition.x, top: selectorPosition.y },
                animatedModalStyle,
              ]}
            >
              {/* Confirm button */}
              <TouchableOpacity style={styles.selectButton} onPress={handleConfirmSelection} activeOpacity={0.7}>
                <Text style={styles.selectButtonText}>{getButtonText()}</Text>
              </TouchableOpacity>

              {/* Groups (up to 3) */}
              {compactGroups.length > 0 && (
                <View style={styles.compactSection}>
                  <Text style={styles.compactSectionLabel}>Groups</Text>
                  {compactGroups.map(group => {
                    const isSelected = localGroupId === group.id;
                    return (
                      <TouchableOpacity
                        key={group.id}
                        style={[styles.compactGroupRow, isSelected && styles.compactGroupRowSelected]}
                        onPress={() => handleSelectGroup(isSelected ? null : group.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.compactGroupIcon}>
                          <IconSymbol name="person.2.fill" size={12} color={isSelected ? CREAM : FUN_PURPLE} />
                        </View>
                        <Text style={[styles.compactGroupName, isSelected && styles.compactGroupNameSelected]} numberOfLines={1}>
                          {group.name}
                        </Text>
                        {isSelected && <IconSymbol name="checkmark" size={10} color={CREAM} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Individual friends */}
              {compactGroups.length > 0 && friends.length > 0 && <View style={styles.divider} />}
              <FlatList
                data={friends}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedUserIds.includes(item.id);
                  return (
                    <TouchableOpacity style={styles.friendItem} onPress={() => handleToggleFriend(item.id)} activeOpacity={0.7}>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.friendAvatar}>
                        {item.avatarUrl ? (
                          <Image source={{ uri: item.avatarUrl }} style={styles.friendAvatarImage} contentFit="cover" recyclingKey={item.id} />
                        ) : (
                        // Initials
                          <Text style={styles.friendAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                        )}
                      </View>
                      <Text style={styles.friendName}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                }}
                style={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />

              {/* More Groups and Friends button */}
              {hasMoreToShow && (
                <TouchableOpacity style={styles.moreButton} onPress={handleOpenFull} activeOpacity={0.7}>
                  <Text style={styles.moreButtonText}>More Groups and Friends</Text>
                  <IconSymbol name="chevron.down" size={12} color={BURGUNDY} />
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Full-screen selector */}
      <FullSelector
        visible={showFullSelector}
        friends={friends}
        groups={groups}
        selectedFriendIds={selectedUserIds}
        selectedGroupId={localGroupId}
        onToggleFriend={handleToggleFriend}
        onSelectGroup={handleSelectGroup}
        onConfirm={handleFullConfirm}
        onClose={handleFullClose}
      />
    </>
  );
});

export default FriendBadgeSelector;

// ─── Compact modal styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  containerRelative: {},
  badgeWithAvatars: {
    alignItems: 'flex-end',
    marginRight: 10,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  selectorContainer: {
    width: 210,
    maxHeight: 340,
    backgroundColor: CREAM,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
    marginBottom: 10,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: CREAM,
    fontFamily: CustomFonts.ztnaturebold,
  },
  // Groups compact
  compactSection: {
    marginBottom: 4,
  },
  compactSectionLabel: {
    fontSize: 10,
    fontFamily: CustomFonts.ztnaturebold,
    color: 'rgba(57,6,23,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  compactGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.08)',
    marginBottom: 4,
  },
  compactGroupRowSelected: {
    backgroundColor: FUN_PURPLE,
  },
  compactGroupIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactGroupName: {
    flex: 1,
    fontSize: 13,
    fontFamily: CustomFonts.ztnatureregular,
    color: BURGUNDY,
  },
  compactGroupNameSelected: {
    color: CREAM,
    fontFamily: CustomFonts.ztnaturebold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 6,
  },
  // Friends
  friendsList: {
    flexGrow: 0,
    maxHeight: 130,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BURGUNDY,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: BOLD_BLUE,
    borderColor: BOLD_BLUE,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    color: CREAM,
  },
  friendAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALE_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: CORNFLOWER_BLUE,
    overflow: 'hidden',
  },
  friendAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  friendAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnaturebold,
  },
  friendName: {
    fontSize: 13,
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnatureregular,
    flex: 1,
  },
  // More button
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  moreButtonText: {
    fontSize: 12,
    fontFamily: CustomFonts.ztnaturebold,
    color: BURGUNDY,
  },
});

// ─── Full-screen modal styles ─────────────────────────────────────────────────

const fullStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  headerBack: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: CustomFonts.ztnaturebold,
    color: '#000',
  },
  headerDone: {
    paddingHorizontal: 4,
  },
  headerDoneText: {
    fontSize: 15,
    fontFamily: CustomFonts.ztnaturebold,
    color: FUN_PURPLE,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontFamily: CustomFonts.ztnaturebold,
    color: 'rgba(0,0,0,0.45)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  groupIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 15,
    fontFamily: CustomFonts.ztnatureregular,
    color: '#000',
  },
  rowSub: {
    fontSize: 12,
    fontFamily: CustomFonts.ztnatureregular,
    color: 'rgba(0,0,0,0.45)',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALE_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitial: {
    fontSize: 17,
    fontFamily: CustomFonts.ztnaturebold,
    color: BOLD_BLUE,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectionCircleFilled: {
    backgroundColor: FUN_PURPLE,
    borderColor: FUN_PURPLE,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginLeft: 72,
  },
});

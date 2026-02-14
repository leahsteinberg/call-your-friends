import AvatarComponent from "@/components/Avatar/Avatar";
import { CustomFonts } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BURGUNDY, CREAM, PALE_BLUE } from "@/styles/styles";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

// ============================================
// ROOT COMPONENT
// ============================================
interface UserCardProps {
  children: React.ReactNode;
  onSwipeDelete?: () => void;
}

function UserCardComponent({ children, onSwipeDelete }: UserCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onSwipeDelete?.();
        }}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[styles.deleteIconContainer, { transform: [{ scale }] }]}
        >
          <IconSymbol name="trash" size={24} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const onSwipeableOpen = (direction: "left" | "right") => {
    if (direction === "right") {
      onSwipeDelete?.();
    }
  };

  const card = (
    <View style={styles.container}>
      <View style={styles.row}>{children}</View>
    </View>
  );

  if (onSwipeDelete) {
    return (
      <View style={styles.outerContainer}>
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          onSwipeableOpen={onSwipeableOpen}
          rightThreshold={80}
          overshootRight={false}
        >
          {card}
        </Swipeable>
      </View>
    );
  }

  return <View style={styles.outerContainer}>{card}</View>;
}

// ============================================
// AVATAR
// ============================================
interface AvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: number;
  children?: React.ReactNode;
}

function UserCardAvatar({
  name,
  avatarUrl,
  size = 56,
  children,
}: AvatarProps) {
  return (
    <View style={styles.avatarContainer}>
      <AvatarComponent
        name={name}
        avatarUrl={avatarUrl}
        size={size}
      >
        {children}
      </AvatarComponent>
    </View>
  );
}

// ============================================
// CONTENT
// ============================================
function Content({ children }: { children: React.ReactNode }) {
  return <View style={styles.content}>{children}</View>;
}

// ============================================
// TITLE
// ============================================
interface TitleProps {
  children: React.ReactNode;
  color?: string;
}

function Title({ children, color }: TitleProps) {
  return (
    <Text style={[styles.title, color ? { color } : undefined]} numberOfLines={1}>
      {children}
    </Text>
  );
}

// ============================================
// SUBTITLE
// ============================================
interface SubtitleProps {
  children: React.ReactNode;
  color?: string;
}

function Subtitle({ children, color }: SubtitleProps) {
  return (
    <Text style={[styles.subtitle, color ? { color } : undefined]} numberOfLines={1}>
      {children}
    </Text>
  );
}

// ============================================
// ACTIONS
// ============================================
function Actions({ children }: { children: React.ReactNode }) {
  return <View style={styles.actions}>{children}</View>;
}

// ============================================
// BUTTON
// ============================================
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "text";
  style?: ViewStyle;
}

function Button({
  children,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: ButtonProps) {
  const variantStyles: Record<string, ViewStyle> = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    text: styles.buttonText,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.button,
        variantStyles[variant],
        (loading || disabled) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? CREAM : BURGUNDY}
        />
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

// ============================================
// COMPOSE & EXPORT
// ============================================
const UserCard = Object.assign(UserCardComponent, {
  Avatar: UserCardAvatar,
  Content,
  Title,
  Subtitle,
  Actions,
  Button,
});

export default UserCard;

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 10,
    marginBottom: 12,
  },
  container: {
    backgroundColor: CREAM,
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 0, 0, 0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.08)",
      },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    fontFamily: CustomFonts.ztnaturebold,
  },
  subtitle: {
    fontSize: 14,
    color: "#8e8e8e",
    fontFamily: CustomFonts.ztnatureregular,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: BURGUNDY,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.15)",
  },
  buttonText: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  deleteAction: {
    backgroundColor: "#DC3545",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

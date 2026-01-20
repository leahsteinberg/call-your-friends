import { CustomFonts } from "@/constants/theme";
import { CORNFLOWER_BLUE, CREAM, ORANGE } from "@/styles/styles";
import * as Haptics from "expo-haptics";
import { Heart } from "lucide-react-native";
import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const ICON_SIZE = 24;

interface TalkSoonButtonProps {
  isActive?: boolean;
  onPress: () => void;
  onNeverMind: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function TalkSoonButton({
  isActive,
  onPress,
  onNeverMind,
  isLoading = false,
  disabled = false,
}: TalkSoonButtonProps): React.JSX.Element {
  console.log("Talk soon button - ", isActive);
  // Animation values for icon bounce
  const iconScale = useSharedValue(1);
  const iconTranslateY = useSharedValue(0);

  // Animation values for sliding text
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);

  const triggerHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Handle the press with animation and haptic feedback
  const handlePress = useCallback(() => {
    if (isLoading || disabled || isActive) return;

    // Trigger haptic feedback
    triggerHaptic();

    // Bounce animation - bounces up (negative Y), never below baseline (0)
    iconScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 400 }),
      withSpring(1.1, { damping: 10, stiffness: 300 }),
      withSpring(1.15, { damping: 12, stiffness: 250 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );

    iconTranslateY.value = withSequence(
      withSpring(-8, { damping: 8, stiffness: 400 }),
      withSpring(-3, { damping: 10, stiffness: 300 }),
      withSpring(-5, { damping: 12, stiffness: 250 }),
      withSpring(0, { damping: 15, stiffness: 200 })
    );

    // Show the sliding text with proper sequencing
    // First reset to starting position, then animate in, hold, then animate out
    textTranslateY.value = withSequence(
      withTiming(10, { duration: 0 }), // Reset to start position
      withSpring(0, { damping: 15, stiffness: 200 }), // Slide up
      withDelay(3500, withTiming(-10, { duration: 300, easing: Easing.in(Easing.ease) })) // Slide away
    );

    textOpacity.value = withSequence(
      withTiming(0, { duration: 0 }), // Reset to invisible
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }), // Fade in
      withDelay(3500, withTiming(0, { duration: 3000, easing: Easing.in(Easing.ease) })) // Fade out
    );

    // Call the actual onPress handler
    if (!isActive) {
      onPress();
    } else {
      onNeverMind();
    }
  }, [isLoading, disabled, isActive, onPress, triggerHaptic]);

  // Reset text animation when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      textOpacity.value = 0;
      textTranslateY.value = 10;
    }
  }, [isActive]);

  // Animated styles
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { translateY: iconTranslateY.value },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>


      {/* Icon button */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading || disabled || isActive}
        activeOpacity={0.7}
        style={[
          styles.button,
          isActive && styles.buttonActive,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={CORNFLOWER_BLUE} />
        ) : (
          <Animated.View style={iconAnimatedStyle}>
            <Heart
              size={ICON_SIZE}
              color={isActive ? CREAM : CORNFLOWER_BLUE}
              fill={isActive ? CREAM : "transparent"}
              strokeWidth={2}
            />
          </Animated.View>
        )}
              {/* Sliding text message */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.messageText}>We'll help you stay in touch soon</Text>
      </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
    overflow: "visible",
    zIndex: 100,
  },
  textContainer: {
    position: "absolute",
    bottom: 52, // Button height (44) + gap (8)
    backgroundColor: CREAM,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
    zIndex: 101,
  },
  messageText: {
    fontSize: 12,
    fontFamily: CustomFonts.ztnaturemedium,
    color: ORANGE,
    textAlign: "center",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: CORNFLOWER_BLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: CORNFLOWER_BLUE,
    borderColor: CORNFLOWER_BLUE,
  },
});

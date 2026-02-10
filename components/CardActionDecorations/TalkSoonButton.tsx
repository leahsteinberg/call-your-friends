import { CustomFonts } from "@/constants/theme";
import { BOLD_GREEN, CREAM, ORANGE } from "@/styles/styles";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { IconSymbol } from "../ui/icon-symbol";

const ICON_SIZE = 24;
const GROWING_SCALE = [1.3, 1.1, 1.15, 1.3];
const SHRINKING_SCALE = [0.7, 0.9, 0.8, 0.9];

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
  console.log("Talk soon button ---------- ", isActive, isLoading);
  const iconScale = useSharedValue(1);
  const fillOpacity = useSharedValue(isActive ? 1 : 0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);

  const triggerHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Handle the press with animation and haptic feedback
  const handlePress = useCallback(() => {
    if (isLoading || disabled ) return;
    if (!isActive) {
      onPress();

    } else {
      onNeverMind();
    }
    const scale = !isActive ? GROWING_SCALE : SHRINKING_SCALE;
    triggerHaptic();
    iconScale.value = withSequence(
      withSpring(scale[0], { damping: 15, stiffness: 200 }),
      withSpring(scale[1], { damping: 10, stiffness: 300 }),
      withSpring(scale[2], { damping: 12, stiffness: 250 }),
      withSpring(scale[3], { damping: 8, stiffness: 200 })
    );

    if (!isActive) {
      // Fade in the fill
      fillOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });

      textTranslateY.value = withSequence(
        withTiming(8, { duration: 0 }), // Start below
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }), // Slide up
        withDelay(1500, withTiming(8, { duration: 2000, easing: Easing.in(Easing.ease) })) // Slide back down
      );

      textOpacity.value = withSequence(
        withTiming(0, { duration: 0 }), // Start invisible
        withTiming(1, { duration: 1500 }), // Fade in
        withDelay(500, withTiming(0, { duration: 2000 })) // Fade out
      );
    } else {
      // Fade out the fill
      fillOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
    }
  }, [isLoading, disabled, isActive, onPress, triggerHaptic]);

  useEffect(() => {
    // Sync state on mount/remount
    iconScale.value = withTiming(1, { duration: 1000 });
    fillOpacity.value = isActive ? 1 : 0;
    if (!isActive) {
      textOpacity.value = 0;
      textTranslateY.value = 8;
    }
  }, [isActive]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fillOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading || disabled}
        activeOpacity={0.7}
        style={[
          styles.button,
          isActive && styles.buttonActive,
        ]}
      >
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          {/* Outline layer - always visible */}
          <IconSymbol
               name="heart"
               size={ICON_SIZE}
               color={ORANGE}
               fill="transparent"
               strokeWidth={2}
            />
          {/* Fill layer - animated opacity */}
          <Animated.View style={[styles.fillLayer, fillAnimatedStyle]}>
            <IconSymbol
               name="heart.fill"
               size={ICON_SIZE}
               fill={BOLD_GREEN}
               color={BOLD_GREEN}
               strokeWidth={1}
            />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      <Animated.Text style={[styles.captionText, textAnimatedStyle]}>
        We'll help you stay in touch
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonActive: {},
  iconContainer: {
    position: "relative",
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  fillLayer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  captionText: {
    fontSize: 13,
    fontFamily: CustomFonts.ztnaturemedium,
    color: CREAM,
    marginTop: 4,
  },
});

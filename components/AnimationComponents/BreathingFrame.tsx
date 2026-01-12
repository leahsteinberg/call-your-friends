import { PALE_BLUE } from '@/styles/styles';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

interface BreathingFrameProps {
  children: React.ReactNode;
  glowColor?: string;
  minOpacity?: number;
  maxOpacity?: number;
  minBorderWidth?: number;
  maxBorderWidth?: number;
  minShadowRadius?: number;
  maxShadowRadius?: number;
  duration?: number;
  borderRadius?: number;
}

export default function BreathingFrame({
  children,
  glowColor = '#4A90E2',
  minOpacity = 0.3,
  maxOpacity = 0.9,
  minBorderWidth = 1,
  maxBorderWidth = 3,
  minShadowRadius = 4,
  maxShadowRadius = 16,
  duration = 2000,
  borderRadius = 12,
  withShadow = false,
}: BreathingFrameProps) {
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    // Start the breathing animation immediately
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Repeat indefinitely
      false
    );
  }, [duration]);

  const glowAnimatedStyle = useAnimatedStyle(() => {
    'worklet';

    // Interpolate border width and shadow radius
    const borderWidth = interpolate(
      glowIntensity.value,
      [0, 1],
      [minBorderWidth, maxBorderWidth]
    );

    const shadowRadius = minShadowRadius + (maxShadowRadius - minShadowRadius) * glowIntensity.value;

    // Use interpolateColor to animate the border color with opacity
    // Create transparent and opaque versions of the glow color
    const transparentColor = glowColor + Math.round(minOpacity * 255).toString(16).padStart(2, '0');
    const opaqueColor = glowColor + Math.round(maxOpacity * 255).toString(16).padStart(2, '0');

    const borderColor = interpolateColor(
      glowIntensity.value,
      [0, 1],
      [transparentColor, opaqueColor]
    );

    const shadowOpacity = minOpacity + (maxOpacity - minOpacity) * glowIntensity.value * 0.8;

    return withShadow ? ({
      borderWidth,
      borderColor,
      shadowOpacity,
      shadowRadius,
    }) : {borderWidth, borderColor: PALE_BLUE};
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderRadius,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          elevation: 8,
        },
        glowAnimatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base styles
  },
});

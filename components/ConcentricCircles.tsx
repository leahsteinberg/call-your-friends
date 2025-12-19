import { BRIGHT_BLUE, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from '@/styles/styles';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

interface ConcentricCirclesProps {
  isActive: boolean;
}

const INNERMOST_SIZE = 40;
const MIDDLE1_SIZE = 60;
const MIDDLE2_SIZE = 80;
const OUTERMOST_SIZE = 100;
const SCALE_FACTOR = 1.3; // 30% larger
const ANIM_DURATION = 800;

export default function ConcentricCircles({ isActive }: ConcentricCirclesProps) {
  // Single progress value that drives all animations - ensures perfect synchronization
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Single looping animation from 0 to 1 (1600ms cycle)
      progress.value = withRepeat(
        withTiming(1, { duration: 3200, easing: Easing.linear }),
        -1, // infinite
        false
      );
    } else {
      // Stop animation and return to base
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    }
  }, [isActive]);

  // Each circle interpolates from the shared progress value with different ranges
  // This creates a perfect domino effect without drift

  const innermostAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    let scale = 1;

    if (progress.value <= 0.125) {
      // Expand: 0 to 0.125 (200ms)
      scale = interpolate(progress.value, [0, 0.125], [1, SCALE_FACTOR]);
    } else if (progress.value < 0.875) {
      // Stay at max: 0.125 to 0.875
      scale = SCALE_FACTOR;
    } else {
      // Contract: 0.875 to 1.0 (200ms)
      scale = interpolate(progress.value, [0.875, 1.0], [SCALE_FACTOR, 1]);
    }

    return { transform: [{ scale }] };
  });

  const middle1AnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    let scale = 1;

    if (progress.value < 0.125) {
      // Not started yet
      scale = 1;
    } else if (progress.value <= 0.25) {
      // Expand: 0.125 to 0.25 (200ms)
      scale = interpolate(progress.value, [0.125, 0.25], [1, SCALE_FACTOR]);
    } else if (progress.value < 0.75) {
      // Stay at max: 0.25 to 0.75
      scale = SCALE_FACTOR;
    } else if (progress.value <= 0.875) {
      // Contract: 0.75 to 0.875 (200ms)
      scale = interpolate(progress.value, [0.75, 0.875], [SCALE_FACTOR, 1]);
    } else {
      // Back to base
      scale = 1;
    }

    return { transform: [{ scale }] };
  });

  const middle2AnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    let scale = 1;

    if (progress.value < 0.25) {
      // Not started yet
      scale = 1;
    } else if (progress.value <= 0.375) {
      // Expand: 0.25 to 0.375 (200ms)
      scale = interpolate(progress.value, [0.25, 0.375], [1, SCALE_FACTOR]);
    } else if (progress.value < 0.625) {
      // Stay at max: 0.375 to 0.625
      scale = SCALE_FACTOR;
    } else if (progress.value <= 0.75) {
      // Contract: 0.625 to 0.75 (200ms)
      scale = interpolate(progress.value, [0.625, 0.75], [SCALE_FACTOR, 1]);
    } else {
      // Back to base
      scale = 1;
    }

    return { transform: [{ scale }] };
  });

  const outermostAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    let scale = 1;

    if (progress.value < 0.375) {
      // Not started yet
      scale = 1;
    } else if (progress.value <= 0.5) {
      // Expand: 0.375 to 0.5 (200ms)
      scale = interpolate(progress.value, [0.375, 0.5], [1, SCALE_FACTOR]);
    } else if (progress.value < 0.5) {
      // Stay at max (brief moment)
      scale = SCALE_FACTOR;
    } else if (progress.value <= 0.625) {
      // Contract: 0.5 to 0.625 (200ms)
      scale = interpolate(progress.value, [0.5, 0.625], [SCALE_FACTOR, 1]);
    } else {
      // Back to base
      scale = 1;
    }

    return { transform: [{ scale }] };
  });

  return (
    <View style={styles.container}>
      {/* Outermost circle - lightest color */}
      <Animated.View
        style={[
          styles.circle,
          styles.outermostCircle,
          { width: OUTERMOST_SIZE, height: OUTERMOST_SIZE, borderRadius: OUTERMOST_SIZE / 2 },
          outermostAnimatedStyle,
        ]}
      />
      {/* Middle2 circle */}
      <Animated.View
        style={[
          styles.circle,
          styles.middle2Circle,
          { width: MIDDLE2_SIZE, height: MIDDLE2_SIZE, borderRadius: MIDDLE2_SIZE / 2 },
          middle2AnimatedStyle,
        ]}
      />
      {/* Middle1 circle */}
      <Animated.View
        style={[
          styles.circle,
          styles.middle1Circle,
          { width: MIDDLE1_SIZE, height: MIDDLE1_SIZE, borderRadius: MIDDLE1_SIZE / 2 },
          middle1AnimatedStyle,
        ]}
      />
      {/* Innermost circle - darkest color */}
      <Animated.View
        style={[
          styles.circle,
          styles.innermostCircle,
          { width: INNERMOST_SIZE, height: INNERMOST_SIZE, borderRadius: INNERMOST_SIZE / 2 },
          innermostAnimatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: OUTERMOST_SIZE * SCALE_FACTOR,
    height: OUTERMOST_SIZE * SCALE_FACTOR,
  },
  circle: {
    position: 'absolute',
  },
  innermostCircle: {
    backgroundColor: BRIGHT_BLUE,
  },
  middle1Circle: {
    backgroundColor: CORNFLOWER_BLUE,
  },
  middle2Circle: {
    backgroundColor: PALE_BLUE,
  },
  outermostCircle: {
    backgroundColor: CREAM,
  },
});

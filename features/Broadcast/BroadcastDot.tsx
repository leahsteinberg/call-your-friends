import { CORNFLOWER_BLUE, DARK_GREEN, PALE_BLUE } from '@/styles/styles';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const Switch = ({
  value,
  onPress,
}) => {
  const height = useSharedValue(100);
  const width = useSharedValue(40);


const colorAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
        value.value,
        [0, 1],
        [PALE_BLUE, CORNFLOWER_BLUE]
      );
    const colorValue = withTiming(color, {duration: 100, });
    return {
        backgroundColor: colorValue,
    };
})


  const sizeAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
        value.value,
        [0, 1],
        [0.3, 1]  // Scale from 30% to 100%
    );
    //const scaleValue = withTiming(scale, {easing: Easing.in(Easing.bounce)})
    const color = interpolateColor(
        value.value,
        [0, 1],
        [PALE_BLUE, CORNFLOWER_BLUE]
      );
    return {
        transform: [{ scale }],
        backgroundColor: color,

    };
  });

  return (
    <Pressable onPress={onPress}>
        <Animated.View
          style={[switchStyles.thumb, sizeAnimatedStyle]}/>
    </Pressable>
  );
};

const switchStyles = StyleSheet.create({
  thumb: {
    minHeight: 60,
    minWidth: 60,
    padding: 5,
    aspectRatio: 1,
    backgroundColor: DARK_GREEN,
    borderRadius: 50,
  },
});

export default function BroadcastDot(): React.JSX.Element {
    const isOn = useSharedValue(0);

  const handlePress = () => {
    isOn.value = withTiming(
        isOn.value === 0 ? 1 : 0,
        { duration: 800, easing: Easing.in(Easing.elastic(1))}
    );
  };

  return (
    <View style={styles.container}>
      <Switch value={isOn} onPress={handlePress}  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import HighFiveSvg from '@/assets/images/high-five.svg';
import React from 'react';
import { SvgProps } from 'react-native-svg';

interface HighFiveIconProps extends SvgProps {
  width?: number;
  height?: number;
}

export default function HighFiveIcon({
  width = 150,
  height = 135,
  ...props
}: HighFiveIconProps) {
  return <HighFiveSvg width={width} height={height} {...props} />;
}

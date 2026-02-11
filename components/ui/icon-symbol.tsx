// Fallback for using lucide-react-native on Android and web.
// On iOS, icon-symbol.ios.tsx uses native SF Symbols via expo-symbols.

import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Hand,
  Heart,
  MessageCircle,
  Phone,
  Search,
  Share2,
  Trash2,
  X,
} from 'lucide-react-native';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

// SF Symbol name → Lucide component
const MAPPING: Record<string, React.ComponentType<any>> = {
  'eye': Eye,
  'eye.slash': EyeOff,
  'checkmark': Check,
  'xmark': X,
  'trash': Trash2,
  'heart': Heart,
  'heart.fill': Heart,
  'message': MessageCircle,
  'message.fill': MessageCircle,
  'square.and.arrow.up': Share2,
  'chevron.down': ChevronDown,
  'chevron.up': ChevronUp,
  'phone.fill': Phone,
  'hand.raised.fill': Hand,
  'magnifyingglass': Search,
};

export type IconSymbolName = keyof typeof MAPPING;

/**
 * Cross-platform icon component.
 * Uses SF Symbols on iOS (via icon-symbol.ios.tsx) and lucide-react-native elsewhere.
 * Icon names follow SF Symbol naming conventions.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  fill,
  strokeWidth,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  fill?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  weight?: string;
}) {
  const LucideIcon = MAPPING[name];
  if (!LucideIcon) return null;

  return (
    <LucideIcon
      size={size}
      color={color}
      fill={fill}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
}

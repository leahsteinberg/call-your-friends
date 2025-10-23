import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker from './DateTimePicker'; // React Native UI DatePicker
import SimpleDateTimePicker from './SimpleDateTimePicker'; // Native DateTimePicker
import WebDateTimePicker from './WebDateTimePicker'; // HTML5 inputs for web

interface UnifiedDateTimePickerProps {
  onDateTimeSelect: (dateTime: Date) => void;
  selectedDateTime?: Date;
}

export default function UnifiedDateTimePicker({ onDateTimeSelect, selectedDateTime }: UnifiedDateTimePickerProps) {
  // Choose the best picker for each platform
  if (Platform.OS === 'web') {
    // Use HTML5 inputs for best web experience
    return <WebDateTimePicker onDateTimeSelect={onDateTimeSelect} selectedDateTime={selectedDateTime} />;
  } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // Use native picker for mobile platforms
    return <SimpleDateTimePicker onDateTimeSelect={onDateTimeSelect} selectedDateTime={selectedDateTime} />;
  } else {
    // Fallback to React Native UI DatePicker
    return <DateTimePicker onDateTimeSelect={onDateTimeSelect} selectedDateTime={selectedDateTime} />;
  }
}

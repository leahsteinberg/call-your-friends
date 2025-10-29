import { BURGUNDY, LIGHT_GREEN, PALE_BLUE } from '@/styles/styles';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

interface WebDateTimePickerProps {
  onDateTimeSelect: (dateTime: Date) => void;
  selectedDateTime?: Date;
}

export default function WebDateTimePicker({ onDateTimeSelect, selectedDateTime }: WebDateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    selectedDateTime ? selectedDateTime.toISOString().split('T')[0] : ''
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    selectedDateTime ? selectedDateTime.toTimeString().slice(0, 5) : ''
  );

  console.log("hi", selectedDate, selectedTime)

  const handleDateChange = (dateString: string) => {
    setSelectedDate(dateString);
    if (dateString && selectedTime) {
      const combinedDateTime = new Date(`${dateString}T${selectedTime}`);
      onDateTimeSelect(combinedDateTime);
    }
  };

  const handleTimeChange = (timeString: string) => {
    setSelectedTime(timeString);
    if (selectedDate && timeString) {
      const combinedDateTime = new Date(`${selectedDate}T${timeString}`);
      onDateTimeSelect(combinedDateTime);
    }
  };

  const formatDisplayDateTime = () => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      return dateTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) + ' at ' + dateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return 'Select date and time';
  };

  console.log(new Date().toISOString())

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {/* Display selected date/time */}
        {/* <View style={styles.selectedDateTimeContainer}>
          <Text style={styles.selectedDateTimeText}>
            📅 {formatDisplayDateTime()}
          </Text>
        </View> */}

        {/* Web HTML5 Date and Time Inputs */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Date:</Text>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              style={styles.webInput}
              min={new Date().toISOString().split('T')[0]}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Time:</Text>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              style={styles.webInput}
            />
          </View>
        </View>
      </View>
    );
  }

  // Fallback for non-web platforms
  return (
    <View style={styles.container}>
      <Text style={styles.fallbackText}>
        Date picker not available on this platform
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //marginVertical: 10,
  },
  selectedDateTimeContainer: {
    backgroundColor: LIGHT_GREEN,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BURGUNDY,
  },
  selectedDateTimeText: {
    fontSize: 12,
    color: BURGUNDY,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: BURGUNDY,
    marginBottom: 8,
  },
  webInput: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 0,
    borderColor: BURGUNDY,
    backgroundColor: PALE_BLUE,
    fontSize: 14,
    color: BURGUNDY,
    fontWeight: '400',
    outline: 'none',
    // ':focus': {
    //   borderColor: BURGUNDY,
    //   boxShadow: `0 0 0 2px ${BURGUNDY}20`,
    // },
  },
  fallbackText: {
    fontSize: 16,
    color: BURGUNDY,
    textAlign: 'center',
    padding: 20,
  },
});

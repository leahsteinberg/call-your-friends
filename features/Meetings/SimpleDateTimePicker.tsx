import { BURGUNDY, LIGHT_GREEN, PALE_BLUE } from '@/styles/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SimpleDateTimePickerProps {
  onDateTimeSelect: (dateTime: Date) => void;
  selectedDateTime?: Date;
}

export default function SimpleDateTimePicker({ onDateTimeSelect, selectedDateTime }: SimpleDateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(selectedDateTime || new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(selectedDateTime || new Date());

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      // Combine with existing time
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(selectedTime.getHours());
      combinedDateTime.setMinutes(selectedTime.getMinutes());
      onDateTimeSelect(combinedDateTime);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
      // Combine with existing date
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(time.getHours());
      combinedDateTime.setMinutes(time.getMinutes());
      onDateTimeSelect(combinedDateTime);
    }
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* Display selected date/time */}
      <View style={styles.selectedDateTimeContainer}>
        <Text style={styles.selectedDateTimeText}>
          📅 {formatDisplayDate(selectedDate)} at {formatDisplayTime(selectedTime)}
        </Text>
      </View>

      {/* Date and Time Selection Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dateButton]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.buttonText}>
            📅 Select Date
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.timeButton]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.buttonText}>
            🕐 Select Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          style={styles.picker}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          style={styles.picker}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
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
    fontSize: 16,
    color: BURGUNDY,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  dateButton: {
    backgroundColor: PALE_BLUE,
    borderColor: BURGUNDY,
  },
  timeButton: {
    backgroundColor: PALE_BLUE,
    borderColor: BURGUNDY,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BURGUNDY,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: BURGUNDY,
  },
});

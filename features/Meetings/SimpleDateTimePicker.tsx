import { BURGUNDY, LIGHT_GREEN, ORANGE, PALE_BLUE } from '@/styles/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface SimpleDateTimePickerProps {
  onDateTimeSelect: (dateTime: Date) => void;
  selectedDateTime?: Date;
}

export default function SimpleDateTimePicker({ onDateTimeSelect, selectedDateTime }: SimpleDateTimePickerProps) {
  const [selectedDate, setSelectedDate   ] = useState<Date>(selectedDateTime || new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(selectedDateTime || new Date());
  const handleDateChange = (event: any, date?: Date) => {
    
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
      <View style={styles.selectorContainer}>
        <DateTimePicker
          value={selectedDate}
          mode="date"
          onChange={handleDateChange}
          minimumDate={new Date()}
          style={styles.picker}
          themeVariant='light'
        />
        <DateTimePicker
          value={selectedTime}
          mode="time"
          textColor="red"
          onChange={handleTimeChange}
          style={styles.picker}
          themeVariant='light'
        />
      </View>
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
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
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
    //backgroundColor: 'white',
    textColor: ORANGE,
    borderRadius: 8,
    marginTop: 10,
    //borderWidth: 1,
    //borderColor: BURGUNDY,
  },
});

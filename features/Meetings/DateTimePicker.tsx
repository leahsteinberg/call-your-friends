import { BURGUNDY, LIGHT_GREEN, PALE_BLUE } from '@/styles/styles';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-ui-datepicker';

interface DateTimePickerProps {
  onDateTimeSelect: (dateTime: Date) => void;
  selectedDateTime?: Date;
}

export default function DateTimePicker({ onDateTimeSelect, selectedDateTime }: DateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selectedDateTime);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(selectedDateTime);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    
    // If time is already selected, combine them
    if (selectedTime) {
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(selectedTime.getHours());
      combinedDateTime.setMinutes(selectedTime.getMinutes());
      onDateTimeSelect(combinedDateTime);
    } else {
      // Default to current time if no time selected
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(new Date().getHours());
      combinedDateTime.setMinutes(new Date().getMinutes());
      onDateTimeSelect(combinedDateTime);
    }
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setShowTimePicker(false);
    
    // If date is already selected, combine them
    if (selectedDate) {
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(time.getHours());
      combinedDateTime.setMinutes(time.getMinutes());
      onDateTimeSelect(combinedDateTime);
    } else {
      // Default to today if no date selected
      const today = new Date();
      const combinedDateTime = new Date(today);
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

  const formatDisplayDateTime = (date: Date) => {
    return `${formatDisplayDate(date)} at ${formatDisplayTime(date)}`;
  };

  return (
    <View style={styles.container}>
      {/* Display selected date/time */}
      {selectedDate && selectedTime && (
        <View style={styles.selectedDateTimeContainer}>
          <Text style={styles.selectedDateTimeText}>
            📅 {formatDisplayDateTime(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), selectedTime.getHours(), selectedTime.getMinutes()))}
          </Text>
        </View>
      )}

      {/* Date and Time Selection Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dateButton]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.buttonText}>
            📅 {selectedDate ? formatDisplayDate(selectedDate) : 'Select Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.timeButton]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.buttonText}>
            🕐 {selectedTime ? formatDisplayTime(selectedTime) : 'Select Time'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Date</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <DatePicker
            mode="single"
            date={selectedDate}
            onChange={handleDateSelect}
            selectedItemColor={BURGUNDY}
            todayTextStyle={{
              color: BURGUNDY,
              fontWeight: 'bold',
            }}
            selectedTextStyle={{
              color: 'white',
            }}
            headerTextStyle={{
              color: BURGUNDY,
              fontWeight: 'bold',
            }}
            weekDaysTextStyle={{
              color: BURGUNDY,
            }}
            calendarTextStyle={{
              color: '#333',
            }}
            headerButtonColor={BURGUNDY}
            headerButtonSize={20}
            style={styles.datePicker}
          />
        </View>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Time</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <DatePicker
            mode="time"
            date={selectedTime}
            onChange={handleTimeSelect}
            selectedItemColor={BURGUNDY}
            headerTextStyle={{
              color: BURGUNDY,
              fontWeight: 'bold',
            }}
            headerButtonColor={BURGUNDY}
            headerButtonSize={20}
            style={styles.timePicker}
          />
        </View>
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
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: BURGUNDY,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BURGUNDY,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BURGUNDY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePicker: {
    borderRadius: 8,
  },
  timePicker: {
    borderRadius: 8,
  },
});

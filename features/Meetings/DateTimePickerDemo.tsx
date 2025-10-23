import { BURGUNDY } from '@/styles/styles';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import UnifiedDateTimePicker from './UnifiedDateTimePicker';

export default function DateTimePickerDemo() {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>();

  const handleDateTimeSelect = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
    console.log('Selected date/time:', dateTime);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date & Time Picker Demo</Text>
      <Text style={styles.subtitle}>
        Platform: {Platform.OS} - Testing cross-platform compatibility
      </Text>
      
      <UnifiedDateTimePicker 
        onDateTimeSelect={handleDateTimeSelect}
        selectedDateTime={selectedDateTime}
      />
      
      {selectedDateTime && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Selected:</Text>
          <Text style={styles.resultText}>
            {selectedDateTime.toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          <Text style={styles.resultText}>
            ISO: {selectedDateTime.toISOString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BURGUNDY,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: BURGUNDY,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BURGUNDY,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});

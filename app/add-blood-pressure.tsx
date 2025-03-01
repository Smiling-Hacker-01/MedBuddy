import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './constants/colors';
import { addBloodPressureReading } from './data/bloodPressure';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AddBloodPressureScreen() {
  const router = useRouter();
  const [reading, setReading] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    date: new Date(),
    time: new Date(),
    note: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    const systolic = parseInt(reading.systolic);
    const diastolic = parseInt(reading.diastolic);
    const pulse = reading.pulse ? parseInt(reading.pulse) : undefined;
    
    if (systolic && diastolic) {
      addBloodPressureReading({
        systolic,
        diastolic,
        pulse,
        date: reading.date.toISOString().split('T')[0],
        time: reading.time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        notes: reading.note || undefined,
      });
      router.back();
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReading(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setReading(prev => ({ ...prev, time: selectedTime }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Blood Pressure Reading</Text>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.readingContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Systolic (mmHg)*</Text>
            <TextInput
              style={styles.input}
              value={reading.systolic}
              onChangeText={(text) => setReading(prev => ({ ...prev, systolic: text }))}
              placeholder="120"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diastolic (mmHg)*</Text>
            <TextInput
              style={styles.input}
              value={reading.diastolic}
              onChangeText={(text) => setReading(prev => ({ ...prev, diastolic: text }))}
              placeholder="80"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pulse (bpm)</Text>
          <TextInput
            style={styles.input}
            value={reading.pulse}
            onChangeText={(text) => setReading(prev => ({ ...prev, pulse: text }))}
            placeholder="72"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.dateTimeContainer}>
          <Pressable 
            style={styles.dateTimePicker} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.label}>Date*</Text>
            <Text style={styles.dateTimeText}>
              {reading.date.toLocaleDateString()}
            </Text>
          </Pressable>

          <Pressable 
            style={styles.dateTimePicker} 
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.label}>Time*</Text>
            <Text style={styles.dateTimeText}>
              {reading.time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </Pressable>
        </View>

        {(showDatePicker || showTimePicker) && (
          <DateTimePicker
            value={showDatePicker ? reading.date : reading.time}
            mode={showDatePicker ? 'date' : 'time'}
            is24Hour={true}
            onChange={showDatePicker ? onDateChange : onTimeChange}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={reading.note}
            onChangeText={(text) => setReading(prev => ({ ...prev, note: text }))}
            placeholder="Add any notes about this reading"
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  readingContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dateTimePicker: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.text,
  },
}); 
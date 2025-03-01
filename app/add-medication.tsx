import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './constants/colors';
import { medications, getFrequencyText, calculateNextRefillDate } from './data/medications';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AddMedicationScreen() {
  const router = useRouter();
  const [medication, setMedication] = useState({
    name: '',
    dosage: '',
    frequency: 1,
    times: [{ time: new Date() }],
    pillsRemaining: '',
    nextRefillDate: new Date(),
    notes: '',
  });

  const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);
  const [showRefillDatePicker, setShowRefillDatePicker] = useState(false);

  const handleSave = () => {
    if (!medication.name || !medication.dosage || !medication.pillsRemaining) {
      alert('Please fill in all required fields');
      return;
    }

    medications.add({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times.map(t => ({
        time: t.time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        taken: false
      })),
      pillsRemaining: parseInt(medication.pillsRemaining) || 0,
      nextRefillDate: medication.nextRefillDate.toISOString().split('T')[0],
      notes: medication.notes || undefined,
    });
    router.back();
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (activeTimeIndex === null) return;
    
    setActiveTimeIndex(Platform.OS === 'ios' ? activeTimeIndex : null);
    if (selectedTime) {
      const newTimes = [...medication.times];
      newTimes[activeTimeIndex] = { time: selectedTime };
      setMedication(prev => ({ ...prev, times: newTimes }));
    }
  };

  const onRefillDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowRefillDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMedication(prev => ({ ...prev, nextRefillDate: selectedDate }));
    }
  };

  const updateFrequency = (newFrequency: number) => {
    const times = Array(newFrequency).fill(null).map((_, index) => 
      medication.times[index] || { time: new Date() }
    );
    setMedication(prev => ({ ...prev, frequency: newFrequency, times }));
  };

  const handlePillsRemainingChange = (text: string) => {
    const pillsRemaining = parseInt(text) || 0;
    const nextRefillDate = new Date(calculateNextRefillDate(pillsRemaining, medication.frequency));
    
    setMedication(prev => ({ 
      ...prev, 
      pillsRemaining: text,
      nextRefillDate
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Medication</Text>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medication Name*</Text>
          <TextInput
            style={styles.input}
            value={medication.name}
            onChangeText={(text) => setMedication(prev => ({ ...prev, name: text }))}
            placeholder="Enter medication name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosage*</Text>
          <TextInput
            style={styles.input}
            value={medication.dosage}
            onChangeText={(text) => setMedication(prev => ({ ...prev, dosage: text }))}
            placeholder="e.g., 50mg"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency*</Text>
          <View style={styles.frequencyContainer}>
            {[1, 2, 3, 4].map((num) => (
              <Pressable
                key={num}
                style={[
                  styles.frequencyButton,
                  medication.frequency === num && styles.frequencyButtonActive
                ]}
                onPress={() => updateFrequency(num)}
              >
                <Text style={[
                  styles.frequencyButtonText,
                  medication.frequency === num && styles.frequencyButtonTextActive
                ]}>
                  {num}x
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.frequencyText}>
            {getFrequencyText(medication.frequency)}
          </Text>
        </View>

        {medication.times.map((timeObj, index) => (
          <View key={index} style={styles.inputGroup}>
            <Text style={styles.label}>Time {index + 1}*</Text>
            <Pressable 
              style={styles.dateTimePicker} 
              onPress={() => setActiveTimeIndex(index)}
            >
              <Text style={styles.dateTimeText}>
                {timeObj.time.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pills Remaining</Text>
          <TextInput
            style={styles.input}
            value={medication.pillsRemaining}
            onChangeText={handlePillsRemainingChange}
            placeholder="Number of pills left"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Next Refill Date</Text>
          <View style={styles.dateTimePicker}>
            <Text style={styles.dateTimeText}>
              {medication.nextRefillDate.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={medication.notes}
            onChangeText={(text) => setMedication(prev => ({ ...prev, notes: text }))}
            placeholder="Add any notes about the medication"
            multiline
            numberOfLines={4}
          />
        </View>

        {activeTimeIndex !== null && (
          <DateTimePicker
            value={medication.times[activeTimeIndex].time}
            mode="time"
            is24Hour={true}
            onChange={onTimeChange}
          />
        )}

        {showRefillDatePicker && (
          <DateTimePicker
            value={medication.nextRefillDate}
            mode="date"
            onChange={onRefillDateChange}
          />
        )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
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
  inputGroup: {
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
  dateTimePicker: {
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
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  frequencyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  frequencyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: colors.card,
  },
  frequencyText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
}); 
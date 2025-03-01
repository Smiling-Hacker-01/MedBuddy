import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { colors, glossyEffect } from '../constants/colors';
import { medications, Medication, subscribeToMedicationChanges, getFrequencyText } from '../data/medications';
import { stopCurrentAlarm } from '../utils/alarms';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../components/Button';

// Add this function at the top level, before the MedicationsScreen component
const calculateNextRefillDate = (pillsRemaining: number, frequency: string, times: { time: string }[]) => {
  const dosesPerDay = times.length;
  let daysUntilRefill = Math.floor(pillsRemaining / dosesPerDay);
  
  // Adjust based on frequency
  if (frequency === 'alternate_days') {
    daysUntilRefill = daysUntilRefill * 2;
  } else if (frequency === 'weekly') {
    daysUntilRefill = daysUntilRefill * 7;
  }

  const nextRefillDate = new Date();
  nextRefillDate.setDate(nextRefillDate.getDate() + daysUntilRefill);
  return nextRefillDate.toISOString();
};

export default function MedicationsScreen() {
  const [currentMeds, setCurrentMeds] = useState<Medication[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get initial medications
    setCurrentMeds(medications.getAll());

    // Subscribe to medication changes
    const unsubscribe = subscribeToMedicationChanges((updatedMeds) => {
      setCurrentMeds(updatedMeds);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (medicationId: string, medicationName: string) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medicationName}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => medications.remove(medicationId),
          style: "destructive"
        }
      ]
    );
  };

  const handleTakeDose = async (medicationId: string, timeIndex: number) => {
    try {
      // Stop the current alarm if it's playing for this specific medication
      await stopCurrentAlarm(medicationId, timeIndex);
      
      // Mark the dose as taken
      medications.markTaken(medicationId, timeIndex);
    } catch (error) {
      console.error('Error handling dose:', error);
    }
  };

  const handleSkipDose = async (medicationId: string, timeIndex: number) => {
    try {
      // Stop the current alarm if it's playing for this specific medication
      await stopCurrentAlarm(medicationId, timeIndex);
      
      // Mark the dose as skipped
      medications.markSkipped(medicationId, timeIndex);
    } catch (error) {
      console.error('Error handling dose:', error);
    }
  };

  const formatTime = (time: string) => {
    try {
      return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return time;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Current Medications</Text>
          <Link href="/add-medication" asChild>
            <Pressable style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </Pressable>
          </Link>
        </View>

        {currentMeds.length === 0 ? (
          <Text style={styles.noMedications}>No current medications</Text>
        ) : (
          currentMeds.map((med) => (
            <View key={med.id} style={styles.medicationItem}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationDetails}>
                  {med.dosage} - {getFrequencyText(med.frequency)}
                </Text>
                <View style={styles.timesList}>
                  {med.times.map((timeObj, index) => (
                    <View key={index} style={styles.timeItem}>
                      <Text style={[
                        styles.timeText,
                        timeObj.taken && styles.timeTaken,
                        timeObj.skipped && styles.timeSkipped
                      ]}>
                        {formatTime(timeObj.time)}
                      </Text>
                      {!timeObj.taken && !timeObj.skipped && (
                        <View style={styles.doseActions}>
                          <Button
                            title="Take"
                            variant="primary"
                            size="small"
                            icon="checkmark-circle"
                            onPress={() => handleTakeDose(med.id, index)}
                            style={styles.doseButton}
                          />
                          <Button
                            title="Skip"
                            variant="error"
                            size="small"
                            icon="close-circle"
                            onPress={() => handleSkipDose(med.id, index)}
                            style={styles.doseButton}
                          />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
                {med.notes && (
                  <Text style={styles.medicationNotes}>{med.notes}</Text>
                )}
              </View>
              <View style={styles.medicationActions}>
                <View style={styles.medicationStatus}>
                  <Text style={styles.pillsCount}>
                    Pills: {med.pillsRemaining}
                  </Text>
                  <Text style={styles.refillDate}>
                    Refill: {new Date(med.nextRefillDate).toLocaleDateString()}
                  </Text>
                </View>
                <Pressable 
                  onPress={() => handleDelete(med.id, med.name)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={24} color={colors.error} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '40',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    padding: 8,
  },
  medicationItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  medicationDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  medicationNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  medicationActions: {
    alignItems: 'flex-end',
  },
  medicationStatus: {
    alignItems: 'flex-end',
  },
  pillsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  refillDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginTop: 8,
  },
  timesList: {
    marginTop: 8,
  },
  timeItem: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  timeText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  timeTaken: {
    color: colors.primary,
    textDecorationLine: 'line-through',
  },
  timeSkipped: {
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  doseActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 8,
    gap: 8,
  },
  doseButton: {
    minWidth: 80,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flex: 0.4,
  },
  noMedications: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    padding: 16,
  },
});
import { useState, useEffect } from 'react';
import { BloodPressureReading, deleteBloodPressureReading, subscribeToBloodPressureChanges } from '../data/bloodPressure';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function BloodPressureList({ readings: initialReadings }: { readings: BloodPressureReading[] }) {
  const [readings, setReadings] = useState<BloodPressureReading[]>(initialReadings);

  useEffect(() => {
    const unsubscribe = subscribeToBloodPressureChanges((updatedReadings) => {
      setReadings([...updatedReadings]);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = (id: string) => {
    deleteBloodPressureReading(id);
  };

  return (
    <View style={styles.container}>
      {readings.map(reading => (
        <View key={reading.id} style={styles.row}>
          <View style={styles.readingContainer}>
            <Text style={styles.readingText}>
              {reading.date} {reading.time}{'\n'}
              <Text style={styles.readingValues}>
                {reading.systolic}/{reading.diastolic} mmHg
                {reading.pulse ? ` - ${reading.pulse} bpm` : ''}
              </Text>
              {reading.notes && (
                <Text style={styles.notes}>{'\n'}{reading.notes}</Text>
              )}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => handleDelete(reading.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 5,
  },
  readingContainer: {
    flex: 1,
  },
  readingText: {
    fontSize: 16,
  },
  readingValues: {
    fontWeight: 'bold',
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteText: {
    color: 'white',
    fontSize: 14,
  },
}); 
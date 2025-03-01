import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './constants/colors';
import { doctors } from './data/doctors';
import { appointments } from './data/appointments';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AddAppointmentScreen() {
  const router = useRouter();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointment, setAppointment] = useState({
    date: new Date(),
    time: new Date(),
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString();
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDoctorSelect = (doctorId: string) => {
    console.log('Selected doctor:', doctorId); // Debug log
    setSelectedDoctorId(doctorId);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setAppointment(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setAppointment(prev => ({ ...prev, time: selectedTime }));
    }
  };

  const handleSave = () => {
    if (!selectedDoctorId) {
      alert('Please select a doctor');
      return;
    }

    const timeString = appointment.time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const newAppointment = {
      doctorId: selectedDoctorId,
      date: formatDateForAPI(appointment.date),
      time: timeString,
      notes: appointment.notes || undefined,
    };

    appointments.add(newAppointment);
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Appointment</Text>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Doctor</Text>
          {doctors.map(doctor => (
            <Pressable
              key={doctor.id}
              onPress={() => handleDoctorSelect(doctor.id)}
              style={({pressed}) => [
                styles.doctorCard,
                selectedDoctorId === doctor.id && styles.selectedDoctorCard,
                pressed && styles.pressedDoctorCard
              ]}
            >
              <Text style={[
                styles.doctorName,
                selectedDoctorId === doctor.id && styles.selectedDoctorText
              ]}>
                {doctor.name}
              </Text>
              <Text style={[
                styles.doctorSpecialty,
                selectedDoctorId === doctor.id && styles.selectedDoctorText
              ]}>
                {doctor.specialty}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          {Platform.OS === 'android' && (
            <Pressable
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formatDateForDisplay(appointment.date)}</Text>
            </Pressable>
          )}
          {(showDatePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={appointment.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Time</Text>
          {Platform.OS === 'android' && (
            <Pressable
              style={styles.dateInput}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>
                {appointment.time.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </Text>
            </Pressable>
          )}
          {(showTimePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={appointment.time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={appointment.notes}
            onChangeText={(text) => setAppointment(prev => ({ ...prev, notes: text }))}
            placeholder="Add any notes about the appointment"
            multiline
          />
        </View>
      </View>
    </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  form: {
    padding: 16,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  doctorCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  selectedDoctorCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  pressedDoctorCard: {
    opacity: 0.7,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedDoctorText: {
    color: colors.primary,
  },
  dateInput: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesInput: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
}); 
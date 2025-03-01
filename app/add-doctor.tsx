import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './constants/colors';
import { addDoctor } from './data/doctors';

export default function AddDoctorScreen() {
  const router = useRouter();
  const [doctorData, setDoctorData] = useState({
    name: '',
    specialty: '',
    phone: '',
    hospitalName: '',
    hospitalPhone: '',
    address: '',
    notes: '',
  });

  const handleSave = () => {
    if (doctorData.name && doctorData.specialty) {
      addDoctor(doctorData);
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Doctor</Text>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doctor Name*</Text>
          <TextInput
            style={styles.input}
            value={doctorData.name}
            onChangeText={(text) => setDoctorData(prev => ({ ...prev, name: text }))}
            placeholder="Enter doctor's name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialty*</Text>
          <TextInput
            style={styles.input}
            value={doctorData.specialty}
            onChangeText={(text) => setDoctorData(prev => ({ ...prev, specialty: text }))}
            placeholder="Enter specialty"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            value={doctorData.phone}
            onChangeText={(text) => setDoctorData(prev => ({ ...prev, phone: text }))}
            placeholder="Enter contact number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hospital/Clinic Name</Text>
          <TextInput
            style={styles.input}
            value={doctorData.hospitalName}
            onChangeText={(text) => setDoctorData(prev => ({ ...prev, hospitalName: text }))}
            placeholder="Enter hospital/clinic name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hospital/Clinic Contact</Text>
          <TextInput
            style={styles.input}
            value={doctorData.hospitalPhone}
            onChangeText={(text) => setDoctorData(prev => ({ ...prev, hospitalPhone: text }))}
            placeholder="Enter hospital/clinic contact"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={doctorData.address}
            onChangeText={(text) => setDoctorData(prev => ({ ...prev, address: text }))}
            placeholder="Enter hospital/clinic address"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={doctorData.notes}
            onChangeText={(text) => setDoctorData(prev => ({ ...prev, notes: text }))}
            placeholder="Add any additional notes"
            multiline
            numberOfLines={3}
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
}); 
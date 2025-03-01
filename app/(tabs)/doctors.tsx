import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { colors, glossyEffect } from '../constants/colors';
import { useState, useEffect } from 'react';
import { doctors, subscribeToDoctorChanges, Doctor, removeDoctor, addPrescription, removePrescription, Prescription } from '../data/doctors';
import { appointments, subscribeToAppointmentChanges, Appointment } from '../data/appointments';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString();
};

export default function DoctorsScreen() {
  const router = useRouter();
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(doctors);
  const [doctorAppointments, setDoctorAppointments] = useState<{[key: string]: Appointment[]}>({});

  useEffect(() => {
    setDoctorsList(doctors);

    const updateDoctorAppointments = () => {
      const allAppointments = appointments.getAll();
      const now = new Date();
      
      // Group upcoming appointments by doctor
      const grouped = allAppointments.reduce((acc: {[key: string]: Appointment[]}, appointment) => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        if (appointmentDate >= now) {
          if (!acc[appointment.doctorId]) {
            acc[appointment.doctorId] = [];
          }
          acc[appointment.doctorId].push(appointment);
        }
        return acc;
      }, {});

      setDoctorAppointments(grouped);
    };

    // Initial update
    updateDoctorAppointments();

    // Subscribe to changes
    const unsubDoctors = subscribeToDoctorChanges((updatedDoctors) => {
      setDoctorsList(updatedDoctors);
    });

    const unsubAppts = subscribeToAppointmentChanges(() => {
      updateDoctorAppointments();
    });

    return () => {
      unsubDoctors();
      unsubAppts();
    };
  }, []);

  const handleRemoveDoctor = (id: string) => {
    const upcomingAppointments = appointments.getUpcoming();
    const doctorUpcomingAppointments = upcomingAppointments.filter(apt => apt.doctorId === id);

    if (doctorUpcomingAppointments.length > 0) {
      alert('Cannot remove doctor with upcoming appointments');
      return;
    }
    
    removeDoctor(id);
  };

  const handleCall = async (phoneNumber: string) => {
    try {
      await Linking.openURL(`tel:${phoneNumber.replace(/\s+/g, '')}`);
    } catch (error) {
      alert('Unable to make call. Please try again.');
    }
  };

  const handleUploadPrescription = async (doctorId: string) => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const today = new Date().toISOString().split('T')[0];
        addPrescription(doctorId, {
          date: today,
          imageUri: result.assets[0].uri,
          notes: ''
        });
      }
    } catch (error) {
      alert('Error uploading prescription. Please try again.');
    }
  };

  const handlePrescriptionPress = (doctorId: string, prescriptionId: string) => {
    router.push(`/(root)/prescription-viewer?doctorId=${doctorId}&prescriptionId=${prescriptionId}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Doctors</Text>
          <Link href="/add-doctor" asChild>
            <Pressable style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </Pressable>
          </Link>
        </View>

        {doctorsList.length === 0 ? (
          <Text style={styles.emptyText}>No doctors added yet</Text>
        ) : (
          doctorsList.map((doctor) => (
            <View key={doctor.id} style={styles.doctorCard}>
              <View style={styles.doctorHeader}>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                </View>
                <View style={styles.headerButtons}>
                  <Pressable 
                    onPress={() => handleCall(doctor.phone)}
                    style={styles.callButton}
                  >
                    <Ionicons name="call" size={24} color={colors.success} />
                  </Pressable>
                  <Pressable 
                    onPress={() => handleRemoveDoctor(doctor.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={24} color={colors.error} />
                  </Pressable>
                </View>
              </View>

              {doctorAppointments[doctor.id]?.length > 0 && (
                <View style={styles.appointmentBadge}>
                  <Ionicons name="calendar" size={16} color={colors.primary} />
                  <Text style={styles.appointmentBadgeText}>
                    Next appointment: {formatDate(doctorAppointments[doctor.id][0].date)} at {doctorAppointments[doctor.id][0].time}
                  </Text>
                </View>
              )}

              <View style={styles.contactInfo}>
                <Pressable 
                  style={styles.contactItem}
                  onPress={() => handleCall(doctor.phone)}
                >
                  <Ionicons name="call" size={20} color={colors.primary} />
                  <Text style={styles.contactText}>{doctor.phone}</Text>
                  <View style={styles.callBadge}>
                    <Text style={styles.callBadgeText}>Tap to call</Text>
                  </View>
                </Pressable>
                <View style={styles.contactItem}>
                  <Ionicons name="business" size={20} color={colors.primary} />
                  <Text style={styles.contactText}>{doctor.clinicName}</Text>
                </View>
                <Pressable 
                  style={styles.contactItem}
                  onPress={() => handleCall(doctor.clinicPhone)}
                >
                  <Ionicons name="call" size={20} color={colors.primary} />
                  <Text style={styles.contactText}>{doctor.clinicPhone}</Text>
                  <View style={styles.callBadge}>
                    <Text style={styles.callBadgeText}>Tap to call</Text>
                  </View>
                </Pressable>
                {doctor.address && (
                  <View style={styles.contactItem}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <Text style={styles.contactText}>{doctor.address}</Text>
                  </View>
                )}
                {doctor.notes && (
                  <View style={styles.contactItem}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={styles.contactText}>{doctor.notes}</Text>
                  </View>
                )}
              </View>

              {/* Prescriptions Section */}
              <View style={styles.prescriptionsSection}>
                <View style={styles.prescriptionHeader}>
                  <Text style={styles.prescriptionTitle}>Prescriptions</Text>
                  <Pressable 
                    onPress={() => handleUploadPrescription(doctor.id)}
                    style={styles.uploadButton}
                  >
                    <Ionicons name="add-circle" size={24} color={colors.primary} />
                  </Pressable>
                </View>

                {(!doctor.prescriptions || doctor.prescriptions.length === 0) ? (
                  <Text style={styles.emptyText}>No prescriptions uploaded</Text>
                ) : (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.prescriptionList}
                  >
                    {doctor.prescriptions.map((prescription) => (
                      <Pressable
                        key={prescription.id}
                        style={styles.prescriptionCard}
                        onPress={() => handlePrescriptionPress(doctor.id, prescription.id)}
                      >
                        <Image 
                          source={{ uri: prescription.imageUri }} 
                          style={styles.prescriptionImage} 
                        />
                        <View style={styles.prescriptionInfo}>
                          <Text style={styles.prescriptionDate}>
                            {new Date(prescription.date).toLocaleDateString()}
                          </Text>
                          <Pressable 
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent press
                              removePrescription(doctor.id, prescription.id);
                            }}
                            style={styles.deletePrescription}
                          >
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                          </Pressable>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
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
  doctorCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  appointmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary + '10',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  appointmentBadgeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callButton: {
    padding: 8,
  },
  callBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  callBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '500',
  },
  prescriptionsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  uploadButton: {
    padding: 8,
  },
  prescriptionList: {
    flexDirection: 'row',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  prescriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary + '20',
    width: 150,
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  prescriptionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  prescriptionInfo: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prescriptionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deletePrescription: {
    padding: 4,
  },
}); 
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { colors, glossyEffect } from '../constants/colors';
import { medications, Medication } from '../data/medications';
import { 
  getFormattedReadings, 
  bloodPressureReadings, 
  subscribeToBloodPressureChanges,
  BloodPressureReading 
} from '../data/bloodPressure';
import { appointments, deleteAppointment, subscribeToAppointmentChanges, Appointment, markAppointmentVisited } from '../data/appointments';
import { BloodPressureList } from '../components/BloodPressureList';
import { useState, useEffect } from 'react';
import { subscribeToMedicationChanges } from '../data/medications';
import { doctors } from '../data/doctors';
import { setupMedicationAlarms, updateMedicationAlarms, cleanupAlarms } from '../utils/alarms';
import { StatusBar } from 'expo-status-bar';

const screenWidth = Dimensions.get('window').width;

const BloodPressureChart = () => {
  const [chartData, setChartData] = useState(getFormattedReadings());

  useEffect(() => {
    const unsubscribe = subscribeToBloodPressureChanges(() => {
      setChartData(getFormattedReadings());
    });
    return () => unsubscribe();
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webChartContainer}>
        {chartData.labels.map((label, index) => (
          <View key={index} style={styles.webChartBar}>
            <Text style={styles.webChartLabel}>{label}</Text>
            <View style={[styles.webChartValue, { height: chartData.systolic[index] }]} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <LineChart
      data={{
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.systolic,
            color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`, // Cyan
            strokeWidth: 2,
          },
          {
            data: chartData.diastolic,
            color: (opacity = 1) => `rgba(255, 0, 255, ${opacity})`, // Magenta
            strokeWidth: 2,
          },
        ],
        legend: ['Systolic', 'Diastolic'],
      }}
      width={screenWidth - 40}
      height={220}
      chartConfig={{
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.gradientStart,
        backgroundGradientTo: colors.gradientEnd,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(196, 196, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: "6",
          strokeWidth: "2",
          stroke: colors.primary,
          strokeOpacity: 0.8,
        },
        propsForLabels: {
          fontSize: 12,
          fontWeight: '600',
        },
        propsForVerticalLabels: {
          fontSize: 12,
          fontWeight: '600',
        },
        propsForHorizontalLabels: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
      bezier
      style={{
        ...styles.chart,
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};

export default function Dashboard() {
  const [readings, setReadings] = useState<BloodPressureReading[]>(bloodPressureReadings || []);
  const router = useRouter();
  const [upcomingMedications, setUpcomingMedications] = useState<Medication[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);

  const updateAppointments = (appts: Appointment[]) => {
    const upcoming = appointments.getUpcoming();
    const todaysAppts = appointments.getTodaysAppointments();
    
    // Debug logs
    console.log('All appointments:', appts);
    console.log('Today\'s appointments:', todaysAppts);
    console.log('Upcoming appointments:', upcoming);
    
    setUpcomingAppointments(upcoming);
    setTodaysAppointments(todaysAppts);
  };

  useEffect(() => {
    // Get initial data
    const initialMeds = medications.getAll();
    const allAppointments = appointments.getAll();
    
    // Set up initial alarms
    setupMedicationAlarms(initialMeds);
    
    updateAppointments(allAppointments);
    setUpcomingMedications(initialMeds || []);

    // Subscribe to medication changes
    const unsubMeds = subscribeToMedicationChanges((meds) => {
      setUpcomingMedications(meds || []);
      // Update alarms immediately when medications change
      updateMedicationAlarms(meds);
    });

    const unsubAppts = subscribeToAppointmentChanges((updatedAppointments) => {
      if (Array.isArray(updatedAppointments)) {
        updateAppointments(updatedAppointments);
      }
    });

    return () => {
      unsubMeds();
      unsubAppts();
      cleanupAlarms();
    };
  }, []);

  const handleRemoveMedication = (id: string) => {
    medications.remove(id);
    // Force a re-render of all tabs
    router.replace('/(tabs)');
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

  const handleVisited = (id: string) => {
    markAppointmentVisited(id);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            {/* Debug info */}
            <Text style={styles.debug}>
              Today's Appointments: {todaysAppointments.length}
            </Text>
            <Link href="/add-medication" asChild>
              <Pressable style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </Pressable>
            </Link>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Medications</Text>
            {upcomingMedications.length === 0 ? (
              <Text style={styles.emptyText}>No medications scheduled</Text>
            ) : (
              upcomingMedications.map((med) => (
                <View key={med.id} style={styles.item}>
                  <Text style={styles.itemTitle}>{med.name}</Text>
                  <Text style={styles.itemDetails}>
                    {med.dosage} - {med.times.map(t => formatTime(t.time)).join(', ')}
                  </Text>
                </View>
              ))
            )}
          </View>

          {todaysAppointments.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's Appointments</Text>
              {todaysAppointments.map((appt) => (
                <View key={appt.id} style={styles.item}>
                  <View style={styles.appointmentContent}>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.itemTitle}>
                        {appt.doctorName} (Date: {appt.date})
                      </Text>
                      <Text style={styles.itemDetails}>
                        {appt.doctorSpecialty} - {appt.time}
                      </Text>
                      {appt.notes && (
                        <Text style={styles.itemNotes}>{appt.notes}</Text>
                      )}
                    </View>
                    {!appt.visited && (
                      <Pressable
                        onPress={() => handleVisited(appt.id)}
                        style={styles.visitedButton}
                      >
                        <Text style={styles.visitedButtonText}>Mark Visited</Text>
                      </Pressable>
                    )}
                    {appt.visited && (
                      <View style={styles.visitedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <Text style={styles.visitedText}>Visited</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's Appointments</Text>
              <Text style={styles.emptyText}>No appointments for today</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <Link href="/add-appointment" asChild>
              <Pressable style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </Pressable>
            </Link>
          </View>

          {upcomingAppointments.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming appointments</Text>
          ) : (
            upcomingAppointments.map((appt) => (
              <View key={appt.id} style={styles.appointmentCard}>
                <View style={styles.appointmentContent}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.itemTitle}>{appt.doctorName}</Text>
                    <Text style={styles.itemDetails}>{appt.doctorSpecialty}</Text>
                    <Text style={styles.appointmentTime}>
                      {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </Text>
                    {appt.notes && (
                      <Text style={styles.appointmentNotes}>{appt.notes}</Text>
                    )}
                  </View>
                  <Pressable 
                    onPress={() => deleteAppointment(appt.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={24} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Blood Pressure Trends</Text>
            <Link href="/add-blood-pressure" asChild>
              <Pressable style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </Pressable>
            </Link>
          </View>
          <BloodPressureChart />
          <BloodPressureList readings={readings} />
        </View>
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
  section: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border + '40',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  addButton: {
    padding: 8,
  },
  card: {
    backgroundColor: colors.gradientStart,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  item: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  itemDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 8,
  },
  appointmentCard: {
    backgroundColor: colors.gradientStart,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
    shadowColor: colors.secondary,
    ...glossyEffect,
  },
  appointmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  appointmentNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  visitedButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 12,
  },
  visitedButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  visitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    borderColor: colors.success + '40',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  visitedText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  itemNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  debug: {
    fontSize: 12,
    color: colors.textSecondary,
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
  webChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 220,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderColor: colors.primary + '40',
    borderWidth: 1,
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  webChartBar: {
    alignItems: 'center',
  },
  webChartLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  webChartValue: {
    width: 20,
    backgroundColor: colors.primary,
    borderRadius: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  listContainer: {
    marginTop: 16,
  },
  listItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  readingDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  readingValues: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  systolicValue: {
    color: colors.primary,
    fontWeight: '600',
  },
  diastolicValue: {
    color: colors.secondary,
    fontWeight: '600',
  },
  pulseValue: {
    color: colors.textSecondary,
  },
  noReadings: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
});
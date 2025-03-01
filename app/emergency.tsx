import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { colors, glossyEffect } from './constants/colors';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSharedData, SharedProfileData, subscribeToProfileChanges } from './data/profile';
import { StatusBar } from 'expo-status-bar';

export default function EmergencyScreen() {
  const router = useRouter();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sharedData, setSharedData] = useState<SharedProfileData | null>(null);
  
  useFocusEffect(
    useCallback(() => {
      loadEmergencyContacts();
      loadSharedData();
      const unsubscribe = subscribeToProfileChanges((data) => {
        setSharedData(data);
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  const loadEmergencyContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('emergencyContacts');
      if (savedContacts) {
        setEmergencyContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.log('Error loading contacts:', error);
    }
  };

  const loadSharedData = async () => {
    const data = await getSharedData();
    if (data) {
      setSharedData(data);
    }
  };

  const handleEmergencyCall = (phoneNumber: string) => {
    const platformPrefix = Platform.select({ web: 'tel:', default: 'tel:' });
    Linking.openURL(`${platformPrefix}${phoneNumber}`);
  };

  const selectContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          router.push({
            pathname: '/select-contacts',
            params: {
              currentContacts: JSON.stringify(emergencyContacts),
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Pressable onPress={() => router.push('../')} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#64748b" />
        </Pressable>
        <Text style={styles.headerTitle}>Emergency Information</Text>
      </View>

      <ScrollView style={styles.content}>
        <Pressable 
          style={styles.emergencyButton}
          onPress={() => handleEmergencyCall('108')}>
          <Ionicons name="warning" size={24} color="#ffffff" />
          <Text style={styles.emergencyButtonText}>Call Emergency Services (108)</Text>
        </Pressable>

        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Blood Group</Text>
            <Text style={styles.quickInfoValue}>
              {sharedData?.bloodType || 'Not set'}
            </Text>
          </View>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Weight</Text>
            <Text style={styles.quickInfoValue}>
              {sharedData?.weight ? `${sharedData.weight} kg` : 'Not set'}
            </Text>
          </View>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Height</Text>
            <Text style={styles.quickInfoValue}>
              {sharedData?.height ? `${sharedData.height} cm` : 'Not set'}
            </Text>
          </View>
        </View>

        <View style={styles.emergencyContact}>
          <View style={styles.contactHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <Pressable 
              onPress={selectContacts}
              style={styles.editButton}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>
          
          {emergencyContacts.length === 0 ? (
            <Text style={styles.emptyText}>No emergency contacts added</Text>
          ) : (
            emergencyContacts.map((contact, index) => (
              <Pressable 
                key={index}
                style={styles.contactItem}
                onPress={() => handleEmergencyCall(contact.phoneNumber.replace(/\D/g, ''))}>
                <Ionicons name="person" size={24} color="#2563eb" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                </View>
                <Ionicons name="call" size={24} color="#22c55e" />
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.medicalInfo}>
          <Text style={styles.sectionTitle}>Medical Conditions</Text>
          {sharedData?.conditions && sharedData.conditions.length > 0 ? (
            sharedData.conditions.map((condition, index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.condition}>{condition.name}</Text>
                <Text style={styles.severity}>{condition.notes}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No medical conditions added</Text>
          )}
        </View>

        <View style={styles.allergies}>
          <Text style={styles.sectionTitle}>Allergies & Reactions</Text>
          {sharedData?.allergies && sharedData.allergies.length > 0 ? (
            sharedData.allergies.map((allergy, index) => (
              <View key={index} style={styles.allergyItem}>
                <Ionicons 
                  name="alert-circle" 
                  size={20} 
                  color={colors.error} 
                />
                <View style={styles.allergyInfo}>
                  <Text style={styles.allergyText}>{allergy.name}</Text>
                  <Text style={styles.allergyReaction}>{allergy.notes}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No allergies added</Text>
          )}
        </View>

        <View style={styles.insurance}>
          <Text style={styles.sectionTitle}>Insurance Information</Text>
          {sharedData?.insurance ? (
            <View style={styles.insuranceItem}>
              <Text style={styles.insuranceProvider}>
                {sharedData.insurance.provider || 'Not set'}
              </Text>
              <Text style={styles.insuranceDetails}>
                Policy #: {sharedData.insurance.policyNumber || 'Not set'}
              </Text>
              <Text style={styles.insuranceDetails}>
                Group #: {sharedData.insurance.groupNumber || 'Not set'}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No insurance information added</Text>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
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
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  emergencyButton: {
    backgroundColor: colors.error,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.error + '40',
    shadowColor: colors.error,
    ...glossyEffect,
  },
  emergencyButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickInfo: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  quickInfoItem: {
    marginBottom: 12,
  },
  quickInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emergencyContact: {
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  medicalInfo: {
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  infoItem: {
    marginBottom: 12,
    backgroundColor: colors.gradientStart,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary + '20',
    shadowColor: colors.secondary,
    ...glossyEffect,
  },
  condition: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  severity: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  allergies: {
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  allergyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: colors.gradientStart,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary + '20',
    shadowColor: colors.secondary,
    ...glossyEffect,
  },
  allergyInfo: {
    flex: 1,
    marginLeft: 8,
  },
  allergyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  allergyReaction: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  insurance: {
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
    marginBottom: 32,
  },
  insuranceItem: {
    marginBottom: 12,
    backgroundColor: colors.gradientStart,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary + '20',
    shadowColor: colors.secondary,
    ...glossyEffect,
  },
  insuranceProvider: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  insuranceDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 16,
  },
});
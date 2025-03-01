import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SelectContactsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(
    JSON.parse(params.currentContacts || '[]')
  );

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });
      setContacts(data.filter(contact => contact.phoneNumbers?.length > 0));
    }
  };

  const toggleContact = (contact) => {
    if (selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else if (selectedContacts.length < 3) {
      setSelectedContacts([...selectedContacts, {
        id: contact.id,
        name: contact.name,
        phoneNumber: contact.phoneNumbers[0].number,
      }]);
    }
  };

  const saveContacts = async () => {
    try {
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(selectedContacts));
      router.push('../');
    } catch (error) {
      console.log('Error saving contacts:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('../')} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#64748b" />
        </Pressable>
        <Text style={styles.headerTitle}>Select Emergency Contacts</Text>
        <Pressable 
          onPress={saveContacts}
          disabled={selectedContacts.length === 0}
          style={[styles.saveButton, selectedContacts.length === 0 && styles.saveButtonDisabled]}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Select up to 3 emergency contacts</Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.contactItem}
            onPress={() => toggleContact(item)}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>
                {item.phoneNumbers[0]?.number}
              </Text>
            </View>
            {selectedContacts.find(c => c.id === item.id) && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </Pressable>
        )}
      />
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  subtitle: {
    padding: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
}); 
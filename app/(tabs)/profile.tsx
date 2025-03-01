import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Modal, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, glossyEffect } from '../constants/colors';
import { 
  saveProfile as saveProfileData, 
  getProfile, 
  UserProfile, 
  initialProfile 
} from '../data/profile';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

interface Allergy {
  name: string;
  notes: string;
}

interface MedicalCondition {
  name: string;
  notes: string;
}

const genderOptions = ['Male', 'Female', 'Other'];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof UserProfile>('personalInfo');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await getProfile();
      if (savedProfile) {
        setProfile(savedProfile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const success = await saveProfileData(profile);
      if (success) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile saved successfully');
      } else {
        Alert.alert('Error', 'Failed to save profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const renderSection = (title: string, section: keyof UserProfile) => (
    <Pressable
      style={[
        styles.sectionTab,
        activeSection === section && styles.activeSection,
      ]}
      onPress={() => setActiveSection(section)}
    >
      <Text style={[
        styles.sectionTabText,
        activeSection === section && styles.activeSectionText,
      ]}>
        {title}
      </Text>
    </Pressable>
  );

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          !isEditing && styles.disabledInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        editable={isEditing}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  const addAllergy = () => {
    setProfile(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: [...prev.medicalInfo.allergies, { name: '', notes: '' }]
      }
    }));
  };

  const removeAllergy = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: prev.medicalInfo.allergies.filter((_, i) => i !== index)
      }
    }));
  };

  const addCondition = () => {
    setProfile(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        conditions: [...prev.medicalInfo.conditions, { name: '', notes: '' }]
      }
    }));
  };

  const removeCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        conditions: prev.medicalInfo.conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setProfile(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          dateOfBirth: selectedDate.toISOString().split('T')[0]
        }
      }));
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={profile.personalInfo.dateOfBirth ? new Date(profile.personalInfo.dateOfBirth) : new Date()}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      );
    }

    return showDatePicker && (
      <DateTimePicker
        value={profile.personalInfo.dateOfBirth ? new Date(profile.personalInfo.dateOfBirth) : new Date()}
        mode="date"
        display="default"
        onChange={onDateChange}
        maximumDate={new Date()}
      />
    );
  };

  const renderGenderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showGenderModal}
      onRequestClose={() => setShowGenderModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.genderOption}
              onPress={() => {
                setProfile(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, gender: option }
                }));
                setShowGenderModal(false);
              }}
            >
              <Text style={[
                styles.genderOptionText,
                profile.personalInfo.gender === option && styles.selectedGenderText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setProfile(prev => ({
          ...prev,
          profilePicture: `data:image/jpeg;base64,${result.assets[0].base64}`
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to use the camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setProfile(prev => ({
          ...prev,
          profilePicture: `data:image/jpeg;base64,${result.assets[0].base64}`
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    if (!isEditing) return;
    
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.editButtonPressed
          ]}
        >
          <View style={styles.editButtonContent}>
            <Ionicons
              name={isEditing ? "save-outline" : "create-outline"}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.sectionTabs}>
        {renderSection('Personal', 'personalInfo')}
        {renderSection('Medical', 'medicalInfo')}
        {renderSection('Insurance', 'insurance')}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileImageContainer}>
          <Pressable onPress={showImageOptions}>
            {profile.profilePicture ? (
              <Image
                source={{ uri: profile.profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color={colors.textSecondary} />
              </View>
            )}
            {isEditing && (
              <View style={styles.editImageOverlay}>
                <Ionicons name="camera" size={20} color={colors.card} />
              </View>
            )}
          </Pressable>
        </View>

        {activeSection === 'personalInfo' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderInput('Full Name', profile.personalInfo.name,
              (text) => setProfile(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, name: text }
              }))
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <Pressable
                style={[styles.input, !isEditing && styles.disabledInput]}
                onPress={() => isEditing && setShowDatePicker(true)}
              >
                <Text style={[
                  styles.inputText,
                  !profile.personalInfo.dateOfBirth && styles.placeholderText
                ]}>
                  {profile.personalInfo.dateOfBirth || 'Select date of birth'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <Pressable
                style={[styles.input, !isEditing && styles.disabledInput]}
                onPress={() => isEditing && setShowGenderModal(true)}
              >
                <Text style={[
                  styles.inputText,
                  !profile.personalInfo.gender && styles.placeholderText
                ]}>
                  {profile.personalInfo.gender || 'Select gender'}
                </Text>
              </Pressable>
            </View>
            {renderInput('Phone', profile.personalInfo.phone,
              (text) => setProfile(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, phone: text }
              })),
              'phone-pad'
            )}
            {renderInput('Email', profile.personalInfo.email,
              (text) => setProfile(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, email: text }
              })),
              'email-address'
            )}
            {renderInput('Address', profile.personalInfo.address,
              (text) => setProfile(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, address: text }
              })),
              'default',
              true
            )}
          </View>
        )}

        {activeSection === 'medicalInfo' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            {renderInput('Blood Type', profile.medicalInfo.bloodType,
              (text) => setProfile(prev => ({
                ...prev,
                medicalInfo: { ...prev.medicalInfo, bloodType: text }
              }))
            )}
            {renderInput('Height', profile.medicalInfo.height,
              (text) => setProfile(prev => ({
                ...prev,
                medicalInfo: { ...prev.medicalInfo, height: text }
              }))
            )}
            {renderInput('Weight', profile.medicalInfo.weight,
              (text) => setProfile(prev => ({
                ...prev,
                medicalInfo: { ...prev.medicalInfo, weight: text }
              }))
            )}

            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Allergies</Text>
                <Pressable onPress={addAllergy} style={styles.addButton}>
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                </Pressable>
              </View>
              {profile.medicalInfo.allergies.map((allergy, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listItemHeader}>
                    <Text style={styles.listItemTitle}>Allergy {index + 1}</Text>
                    <Pressable onPress={() => removeAllergy(index)} style={styles.removeButton}>
                      <Ionicons name="close-circle-outline" size={24} color={colors.error} />
                    </Pressable>
                  </View>
                  {renderInput('Name', allergy.name,
                    (text) => setProfile(prev => ({
                      ...prev,
                      medicalInfo: {
                        ...prev.medicalInfo,
                        allergies: prev.medicalInfo.allergies.map((a, i) => 
                          i === index ? { ...a, name: text } : a
                        )
                      }
                    }))
                  )}
                  {renderInput('Notes (Severity, Reactions, etc.)', allergy.notes,
                    (text) => setProfile(prev => ({
                      ...prev,
                      medicalInfo: {
                        ...prev.medicalInfo,
                        allergies: prev.medicalInfo.allergies.map((a, i) => 
                          i === index ? { ...a, notes: text } : a
                        )
                      }
                    })),
                    'default',
                    true
                  )}
                </View>
              ))}
            </View>

            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Medical Conditions</Text>
                <Pressable onPress={addCondition} style={styles.addButton}>
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                </Pressable>
              </View>
              {profile.medicalInfo.conditions.map((condition, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listItemHeader}>
                    <Text style={styles.listItemTitle}>Condition {index + 1}</Text>
                    <Pressable onPress={() => removeCondition(index)} style={styles.removeButton}>
                      <Ionicons name="close-circle-outline" size={24} color={colors.error} />
                    </Pressable>
                  </View>
                  {renderInput('Name', condition.name,
                    (text) => setProfile(prev => ({
                      ...prev,
                      medicalInfo: {
                        ...prev.medicalInfo,
                        conditions: prev.medicalInfo.conditions.map((c, i) => 
                          i === index ? { ...c, name: text } : c
                        )
                      }
                    }))
                  )}
                  {renderInput('Notes (Diagnosis Date, Treatment, etc.)', condition.notes,
                    (text) => setProfile(prev => ({
                      ...prev,
                      medicalInfo: {
                        ...prev.medicalInfo,
                        conditions: prev.medicalInfo.conditions.map((c, i) => 
                          i === index ? { ...c, notes: text } : c
                        )
                      }
                    })),
                    'default',
                    true
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeSection === 'insurance' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Insurance Information</Text>
            {renderInput('Insurance Provider', profile.insurance.provider,
              (text) => setProfile(prev => ({
                ...prev,
                insurance: { ...prev.insurance, provider: text }
              }))
            )}
            {renderInput('Policy Number', profile.insurance.policyNumber,
              (text) => setProfile(prev => ({
                ...prev,
                insurance: { ...prev.insurance, policyNumber: text }
              }))
            )}
            {renderInput('Group Number', profile.insurance.groupNumber,
              (text) => setProfile(prev => ({
                ...prev,
                insurance: { ...prev.insurance, groupNumber: text }
              }))
            )}
          </View>
        )}
      </ScrollView>
      {renderDatePicker()}
      {renderGenderModal()}
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
  editButton: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    margin: 16,
    marginTop: -20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSection: {
    backgroundColor: colors.primary + '20', // 20% opacity
  },
  sectionTabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeSectionText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    color: colors.text,
    borderRadius: 8,
    padding: 12,
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  listSection: {
    marginBottom: 28,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    padding: 8,
    backgroundColor: colors.primary + '20', // 20% opacity
    borderRadius: 8,
  },
  listItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  removeButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  modalDone: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  genderOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  genderOptionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  selectedGenderText: {
    color: colors.primary,
    fontWeight: '600',
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  sectionContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    ...glossyEffect,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
});
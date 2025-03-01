import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimpleEventEmitter } from './eventEmitter';

export interface SharedProfileData {
  bloodType: string;
  height: string;
  weight: string;
  allergies: Array<{
    name: string;
    notes: string;
  }>;
  conditions: Array<{
    name: string;
    notes: string;
  }>;
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
}

export interface UserProfile {
  profilePicture?: string; // Base64 string of the image
  personalInfo: {
    name: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
  };
  medicalInfo: {
    bloodType: string;
    height: string;
    weight: string;
    allergies: Array<{ name: string; notes: string }>;
    conditions: Array<{ name: string; notes: string }>;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
}

const PROFILE_STORAGE_KEY = 'userProfile';
const SHARED_DATA_STORAGE_KEY = 'sharedProfileData';

const profileEventEmitter = new SimpleEventEmitter();

// Save both complete profile and shared data
export const saveProfile = async (profile: UserProfile) => {
  try {
    // Save complete profile
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    
    // Extract and save shared data
    const sharedData: SharedProfileData = {
      bloodType: profile.medicalInfo.bloodType,
      height: profile.medicalInfo.height,
      weight: profile.medicalInfo.weight,
      allergies: profile.medicalInfo.allergies,
      conditions: profile.medicalInfo.conditions,
      insurance: profile.insurance,
    };
    
    // Emit update event for real-time sync
    profileEventEmitter.emit('profileUpdate', sharedData);
    
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

// Get complete profile data
export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

// Get only shared data
export const getSharedData = async (): Promise<SharedProfileData | null> => {
  try {
    const profile = await getProfile();
    if (!profile) return null;
    
    return {
      bloodType: profile.medicalInfo.bloodType,
      height: profile.medicalInfo.height,
      weight: profile.medicalInfo.weight,
      allergies: profile.medicalInfo.allergies,
      conditions: profile.medicalInfo.conditions,
      insurance: profile.insurance,
    };
  } catch (error) {
    console.error('Error getting shared data:', error);
    return null;
  }
};

// Subscribe to profile changes
export const subscribeToProfileChanges = (callback: (data: SharedProfileData) => void) => {
  profileEventEmitter.on('profileUpdate', callback);
  return () => profileEventEmitter.off('profileUpdate', callback);
};

// Initial profile state
export const initialProfile: UserProfile = {
  profilePicture: '',
  personalInfo: {
    name: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
  },
  medicalInfo: {
    bloodType: '',
    height: '',
    weight: '',
    allergies: [],
    conditions: [],
  },
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: '',
  },
}; 
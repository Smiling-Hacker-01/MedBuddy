import { useEffect, useState } from 'react';
import { Stack, Slot, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { colors, glossyEffect } from './constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is authenticated (you can modify this based on your auth implementation)
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  // Show nothing while checking authentication status
  if (isAuthenticated === null) {
    return null;
  }

  // If not authenticated, redirect to auth screen
  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  // If authenticated, show the app content
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
            ...glossyEffect,
            borderBottomWidth: 1,
            borderBottomColor: colors.primary + '40',
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
            fontSize: 20,
            fontWeight: '600',
          },
          headerShadowVisible: true,
          statusBarStyle: 'light',
          statusBarColor: colors.background,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="emergency" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="add-medication" 
          options={{ 
            presentation: 'modal',
            title: 'Add Medication',
            headerStyle: {
              backgroundColor: colors.background,
              ...glossyEffect,
              borderBottomWidth: 1,
              borderBottomColor: colors.primary + '40',
            },
          }} 
        />
        <Stack.Screen 
          name="add-blood-pressure" 
          options={{ 
            presentation: 'modal',
            title: 'Add Blood Pressure',
            headerStyle: {
              backgroundColor: colors.background,
              ...glossyEffect,
              borderBottomWidth: 1,
              borderBottomColor: colors.primary + '40',
            },
          }} 
        />
        <Stack.Screen 
          name="add-doctor" 
          options={{ 
            presentation: 'modal',
            title: 'Add Doctor',
            headerStyle: {
              backgroundColor: colors.background,
              ...glossyEffect,
              borderBottomWidth: 1,
              borderBottomColor: colors.primary + '40',
            },
          }} 
        />
        <Stack.Screen 
          name="add-appointment" 
          options={{ 
            presentation: 'modal',
            title: 'Add Appointment',
            headerStyle: {
              backgroundColor: colors.background,
              ...glossyEffect,
              borderBottomWidth: 1,
              borderBottomColor: colors.primary + '40',
            },
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            headerStyle: {
              backgroundColor: colors.background,
              ...glossyEffect,
              borderBottomWidth: 1,
              borderBottomColor: colors.primary + '40',
            },
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
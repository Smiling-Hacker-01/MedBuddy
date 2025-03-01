import { Audio } from 'expo-av';
import { Medication } from '../data/medications';

let alarmSound: Audio.Sound | null = null;
let isAlarmLoaded = false;
let alarmIntervals: NodeJS.Timer[] = [];
let currentAlarmingMedication: { id: string; timeIndex: number } | null = null;

export async function setupMedicationAlarms(medications: Medication[]) {
  try {
    // Clear any existing intervals
    clearAllIntervals();

    if (!isAlarmLoaded && !alarmSound) {
      try {
        // Load the alarm sound with correct path
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/alarm.mp3'),
          { 
            shouldPlay: false,
            isLooping: false,
          }
        );
        alarmSound = sound;
        isAlarmLoaded = true;
      } catch (error) {
        console.log('Sound loading warning:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Set up new time checks for each medication
    medications.forEach(med => {
      med.times.forEach((timeSlot, index) => {
        console.log(`Setting up alarm for ${med.name} at ${timeSlot.time}`);
        const interval = scheduleAlarm(timeSlot.time, med.name, med.dosage, med.id, index);
        alarmIntervals.push(interval);
      });
    });

    // Debug: Log all scheduled times
    console.log('Current medications and times:');
    medications.forEach(med => {
      med.times.forEach(time => {
        console.log(`${med.name}: ${time.time}`);
      });
    });
  } catch (error) {
    console.error('Error setting up alarms:', error);
  }
}

// Add a function to update alarms immediately
export async function updateMedicationAlarms(medications: Medication[]) {
  try {
    // Clear existing alarms
    clearAllIntervals();
    
    // Set up new alarms immediately
    await setupMedicationAlarms(medications);
    
    console.log('Alarms updated with new schedule');
  } catch (error) {
    console.error('Error updating alarms:', error);
  }
}

function scheduleAlarm(timeString: string, medName: string, dosage: string, medicationId: string, timeIndex: number) {
  // Ensure proper time format with padded zeros
  const [rawHours, rawMinutes] = timeString.split(':');
  const targetHours = parseInt(rawHours, 10);
  const targetMinutes = parseInt(rawMinutes, 10);
  
  console.log(`Scheduling alarm for ${medName} at ${targetHours.toString().padStart(2, '0')}:${targetMinutes.toString().padStart(2, '0')}`);
  
  return setInterval(() => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();

    // Debug: Log time checks
    if (currentSeconds === 0) {
      console.log(`Checking time: Current ${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')} vs Target ${targetHours.toString().padStart(2, '0')}:${targetMinutes.toString().padStart(2, '0')}`);
    }

    if (currentHours === targetHours && 
        currentMinutes === targetMinutes && 
        currentSeconds === 0) {
      console.log(`ALARM TIME! Playing alarm for ${medName}`);
      playAlarm(medName, dosage, medicationId, timeIndex);
    }
  }, 1000);
}

function clearAllIntervals() {
  alarmIntervals.forEach(interval => clearInterval(interval));
  alarmIntervals = [];
}

async function playAlarm(medName: string, dosage: string, medicationId: string, timeIndex: number) {
  try {
    if (alarmSound && isAlarmLoaded) {
      // Set the currently alarming medication
      currentAlarmingMedication = { id: medicationId, timeIndex };
      
      console.log(`Starting alarm for ${medName}`);
      await alarmSound.setPositionAsync(0);
      await alarmSound.playAsync();
      
      setTimeout(async () => {
        if (alarmSound && isAlarmLoaded) {
          console.log(`Stopping alarm for ${medName}`);
          await alarmSound.stopAsync();
          currentAlarmingMedication = null;
        }
      }, 30000);
    }
  } catch (error) {
    console.error('Error playing alarm:', error);
    currentAlarmingMedication = null;
  }
}

export async function stopAlarm() {
  try {
    if (alarmSound && isAlarmLoaded) {
      await alarmSound.stopAsync();
    }
  } catch (error) {
    console.error('Error stopping alarm:', error);
  }
}

export async function cleanupAlarms() {
  return new Promise<void>(async (resolve) => {
    try {
      // First clear all intervals
      clearAllIntervals();

      // Check if sound exists and is loaded before attempting cleanup
      if (alarmSound) {
        if (isAlarmLoaded) {
          try {
            await alarmSound.stopAsync();
          } catch (e) {
            console.log('Stop warning:', e instanceof Error ? e.message : 'Unknown error');
          }
          
          try {
            await alarmSound.unloadAsync();
          } catch (e) {
            console.log('Unload warning:', e instanceof Error ? e.message : 'Unknown error');
          }
        }
        alarmSound = null;
      }
      isAlarmLoaded = false;
      resolve();
    } catch (error) {
      // Log error but don't throw
      console.log('Cleanup warning:', error instanceof Error ? error.message : 'Unknown error');
      // Still resolve to prevent hanging
      resolve();
    }
  });
}

// Add this new function to stop current alarm without clearing schedule
export async function stopCurrentAlarm(medicationId?: string, timeIndex?: number) {
  try {
    if (alarmSound && isAlarmLoaded) {
      // Only stop if no specific medication is provided or if it matches the current alarming medication
      if (!medicationId || 
          (currentAlarmingMedication && 
           currentAlarmingMedication.id === medicationId && 
           currentAlarmingMedication.timeIndex === timeIndex)) {
        await alarmSound.stopAsync();
        await alarmSound.setPositionAsync(0);
        currentAlarmingMedication = null;
      }
    }
  } catch (error) {
    console.error('Error stopping current alarm:', error);
    currentAlarmingMedication = null;
  }
} 
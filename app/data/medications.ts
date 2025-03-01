import { SimpleEventEmitter } from './eventEmitter';

export interface MedicationTime {
  time: string;
  taken?: boolean;
  skipped?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: MedicationTime[];
  notes?: string;
}

const medicationEmitter = new SimpleEventEmitter();
export const MEDICATION_CHANGE = 'MEDICATION_CHANGE';

let medicationsList: Medication[] = [];

export const medications = {
  getAll: () => medicationsList,
  
  add: (medication: Omit<Medication, 'id'>) => {
    const newMedication = {
      ...medication,
      id: Date.now().toString(),
      times: medication.times.map(t => ({
        ...t,
        taken: false,
        skipped: false
      }))
    };
    medicationsList = [...medicationsList, newMedication];
    medicationEmitter.emit(MEDICATION_CHANGE, medicationsList);
    return newMedication;
  },

  remove: (id: string) => {
    medicationsList = medicationsList.filter(med => med.id !== id);
    medicationEmitter.emit(MEDICATION_CHANGE, medicationsList);
  },

  update: (id: string, updates: Partial<Medication>) => {
    medicationsList = medicationsList.map(med => 
      med.id === id ? { ...med, ...updates } : med
    );
    medicationEmitter.emit(MEDICATION_CHANGE, medicationsList);
  },

  markTaken: (id: string, timeIndex: number) => {
    medicationsList = medicationsList.map(med => {
      if (med.id === id) {
        const updatedTimes = [...med.times];
        updatedTimes[timeIndex] = { ...updatedTimes[timeIndex], taken: true, skipped: false };
        return { ...med, times: updatedTimes };
      }
      return med;
    });
    medicationEmitter.emit(MEDICATION_CHANGE, medicationsList);
  },

  markSkipped: (id: string, timeIndex: number) => {
    medicationsList = medicationsList.map(med => {
      if (med.id === id) {
        const updatedTimes = [...med.times];
        updatedTimes[timeIndex] = { ...updatedTimes[timeIndex], taken: false, skipped: true };
        return { ...med, times: updatedTimes };
      }
      return med;
    });
    medicationEmitter.emit(MEDICATION_CHANGE, medicationsList);
  },
};

// Add a helper function to safely clean up alarms
export function cleanupAlarms() {
  return new Promise<void>((resolve) => {
    try {
      // If you're using any notification/alarm system, clean it up here
      // For now, just resolve successfully
      resolve();
    } catch (error) {
      // Log the error but don't throw it
      console.log('Alarm cleanup warning:', error instanceof Error ? error.message : 'Unknown error');
      resolve();
    }
  });
}

// Update the subscription cleanup
export function subscribeToMedicationChanges(callback: (medications: Medication[]) => void) {
  try {
    medicationEmitter.on(MEDICATION_CHANGE, callback);
    return async () => {
      try {
        medicationEmitter.off(MEDICATION_CHANGE, callback);
        await cleanupAlarms();
      } catch (error) {
        // Silently handle cleanup errors
        console.log('Cleanup warning:', error instanceof Error ? error.message : 'Unknown error');
      }
    };
  } catch (error) {
    console.log('Subscription warning:', error instanceof Error ? error.message : 'Unknown error');
    return () => {};
  }
}

// Export these for backward compatibility
export const addMedication = medications.add;
export const removeMedication = medications.remove;
export const updateMedication = medications.update;
export const markMedicationTaken = medications.markTaken;
export const markMedicationSkipped = medications.markSkipped;

export function getFrequencyText(frequency: number): string {
  switch (frequency) {
    case 1: return 'Once daily';
    case 2: return 'Twice daily';
    case 3: return 'Thrice daily';
    default: return `${frequency} times daily`;
  }
}

// Initialize with sample data if needed
if (medicationsList.length === 0) {
  medicationsList = [
    {
      id: '1',
      name: 'Aspirin',
      dosage: '100mg',
      frequency: 'Twice daily',
      times: [
        { time: '09:00', taken: false, skipped: false },
        { time: '21:00', taken: false, skipped: false }
      ],
      notes: 'Take with food'
    }
  ];
  medicationEmitter.emit(MEDICATION_CHANGE, medicationsList);
}

// Helper function to get today's medications
export function getTodaysMedications() {
  return medications.getAll().map(med => ({
    name: med.name,
    time: med.times[0].time,
    dosage: med.dosage,
    note: med.notes,
  }));
}

// Helper function to get current medications list
export function getCurrentMedications() {
  return medications.getAll().map(med => ({
    name: med.name,
    dosage: med.dosage,
    note: med.notes,
  }));
}

export const calculateNextRefillDate = (pillsRemaining: number, frequency: number): string => {
  const daysUntilRefill = Math.floor(pillsRemaining / frequency);
  const nextRefillDate = new Date();
  nextRefillDate.setDate(nextRefillDate.getDate() + daysUntilRefill);
  return nextRefillDate.toISOString().split('T')[0];
}; 
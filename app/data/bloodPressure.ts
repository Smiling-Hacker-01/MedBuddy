// Simple EventEmitter implementation
class SimpleEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export interface BloodPressureReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  date: string;
  time: string;
  notes?: string;
}

const bloodPressureEmitter = new SimpleEventEmitter();
export const BLOOD_PRESSURE_CHANGE = 'BLOOD_PRESSURE_CHANGE';

// Initialize with empty array
export let bloodPressureReadings: BloodPressureReading[] = [];

// Helper function to compare dates and times
function compareDatesAndTimes(a: BloodPressureReading, b: BloodPressureReading) {
  const dateA = new Date(`${a.date}T${a.time}`);
  const dateB = new Date(`${b.date}T${b.time}`);
  return dateB.getTime() - dateA.getTime(); // Most recent first
}

// Add a new reading
export function addBloodPressureReading(reading: Omit<BloodPressureReading, 'id'>) {
  const newReading = {
    ...reading,
    id: Date.now().toString(),
  };
  
  bloodPressureReadings = [...bloodPressureReadings, newReading];
  // Sort readings by date and time
  bloodPressureReadings.sort(compareDatesAndTimes);
  
  bloodPressureEmitter.emit(BLOOD_PRESSURE_CHANGE, bloodPressureReadings);
  return newReading;
}

// Delete a reading
export function deleteBloodPressureReading(id: string) {
  bloodPressureReadings = bloodPressureReadings.filter(reading => reading.id !== id);
  bloodPressureEmitter.emit(BLOOD_PRESSURE_CHANGE, bloodPressureReadings);
}

// Get formatted readings for the chart
export function getFormattedReadings() {
  // Readings are already sorted, just take the last 7
  const last7Readings = bloodPressureReadings.slice(0, 7).reverse();

  return {
    labels: last7Readings.map(reading => reading.date),
    systolic: last7Readings.map(reading => reading.systolic),
    diastolic: last7Readings.map(reading => reading.diastolic),
  };
}

// Subscribe to changes
export function subscribeToBloodPressureChanges(callback: (readings: BloodPressureReading[]) => void) {
  bloodPressureEmitter.on(BLOOD_PRESSURE_CHANGE, callback);
  return () => bloodPressureEmitter.off(BLOOD_PRESSURE_CHANGE, callback);
}

// Initialize with some sample data if needed
if (bloodPressureReadings.length === 0) {
  bloodPressureReadings = [
    {
      id: '1',
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      date: '2024-03-01',
      time: '09:00',
    },
    // Add more sample data as needed
  ];
} 
import { SimpleEventEmitter } from './eventEmitter';

export interface Prescription {
  id?: string;  // Made optional for backward compatibility
  date: string;
  imageUri: string;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  clinicName: string;  // Changed from hospitalName to match your UI
  clinicPhone: string; // Changed from hospitalPhone to match your UI
  email?: string;
  address?: string;
  notes?: string;
  prescriptions?: Prescription[];
}

const doctorEmitter = new SimpleEventEmitter();
export const DOCTOR_CHANGE = 'DOCTOR_CHANGE';

// Initialize with empty array instead of default doctors
export let doctors: Doctor[] = [];

export function addDoctor(doctor: Omit<Doctor, 'id'>) {
  const newDoctor = {
    ...doctor,
    id: Date.now().toString(),
    prescriptions: []
  };
  doctors = [...doctors, newDoctor];
  doctorEmitter.emit(DOCTOR_CHANGE, doctors);
  return newDoctor;
}

export function removeDoctor(id: string) {
  doctors = doctors.filter(doc => doc.id !== id);
  doctorEmitter.emit(DOCTOR_CHANGE, doctors);
}

export function subscribeToDoctorChanges(callback: (doctors: Doctor[]) => void) {
  doctorEmitter.on(DOCTOR_CHANGE, callback);
  return () => doctorEmitter.off(DOCTOR_CHANGE, callback);
}

export function addPrescription(doctorId: string, prescription: Omit<Prescription, 'id'>) {
  const newPrescription = {
    ...prescription,
    id: Date.now().toString(),
  };

  doctors = doctors.map(doctor => {
    if (doctor.id === doctorId) {
      return {
        ...doctor,
        prescriptions: [...(doctor.prescriptions || []), newPrescription]
      };
    }
    return doctor;
  });

  doctorEmitter.emit(DOCTOR_CHANGE, doctors);
  return newPrescription;
}

export function removePrescription(doctorId: string, prescriptionIndex: number) {
  doctors = doctors.map(doctor => {
    if (doctor.id === doctorId && doctor.prescriptions) {
      const newPrescriptions = [...doctor.prescriptions];
      newPrescriptions.splice(prescriptionIndex, 1);
      return {
        ...doctor,
        prescriptions: newPrescriptions
      };
    }
    return doctor;
  });

  doctorEmitter.emit(DOCTOR_CHANGE, doctors);
}

// Helper function to update doctor details
export function updateDoctor(id: string, updates: Partial<Doctor>) {
  doctors = doctors.map(doctor => {
    if (doctor.id === id) {
      return { ...doctor, ...updates };
    }
    return doctor;
  });
  doctorEmitter.emit(DOCTOR_CHANGE, doctors);
} 
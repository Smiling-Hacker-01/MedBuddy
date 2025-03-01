import { SimpleEventEmitter } from './eventEmitter';
import { doctors } from './doctors';

export interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  notes?: string;
  visited?: boolean;
  doctorName?: string;
  doctorSpecialty?: string;
}

const appointmentEmitter = new SimpleEventEmitter();
export const APPOINTMENT_CHANGE = 'APPOINTMENT_CHANGE';

let appointmentsList: Appointment[] = [];

// Helper function to format date consistently
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const appointments = {
  getAll: () => appointmentsList,
  
  getUpcoming: () => {
    const now = new Date();
    const today = formatDate(now);
    
    return appointmentsList
      .filter(appt => {
        // Show appointments from today onwards
        return appt.date >= today && !appt.visited;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  },

  getTodaysAppointments: () => {
    const today = formatDate(new Date());
    return appointmentsList.filter(appt => appt.date === today);
  },

  add: (appointment: Omit<Appointment, 'id'>) => {
    const doctor = doctors.find(d => d.id === appointment.doctorId);
    
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      doctorName: doctor?.name || 'Unknown Doctor',
      doctorSpecialty: doctor?.specialty || 'Specialty Unknown',
      visited: false // Explicitly set visited to false for new appointments
    };
    
    appointmentsList = [...appointmentsList, newAppointment];
    appointmentEmitter.emit(APPOINTMENT_CHANGE, appointmentsList);
    return newAppointment;
  },

  delete: (id: string) => {
    appointmentsList = appointmentsList.filter(apt => apt.id !== id);
    appointmentEmitter.emit(APPOINTMENT_CHANGE, appointmentsList);
  },

  markVisited: (id: string) => {
    appointmentsList = appointmentsList.map(apt => 
      apt.id === id ? { ...apt, visited: true } : apt
    );
    appointmentEmitter.emit(APPOINTMENT_CHANGE, appointmentsList);
  }
};

export function subscribeToAppointmentChanges(callback: (appointments: Appointment[]) => void) {
  appointmentEmitter.on(APPOINTMENT_CHANGE, callback);
  return () => appointmentEmitter.off(APPOINTMENT_CHANGE, callback);
}

// Export these for backward compatibility
export const addAppointment = appointments.add;
export const deleteAppointment = appointments.delete;
export const markAppointmentVisited = appointments.markVisited; 
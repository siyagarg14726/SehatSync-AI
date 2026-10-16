import apiClient from './axios';
import { Appointment, Caregiver, Medication, Prescription } from '../types';

interface MedicationResponse {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  reminders?: string | null;
  instructions?: string | null;
  is_active: boolean;
}

interface PrescriptionResponse {
  id: number;
  filename: string;
  doctor_name?: string | null;
  prescription_date: string;
  notes?: string | null;
  file_url?: string | null;
}

interface AppointmentResponse {
  id: number;
  doctor_name: string;
  specialty: string;
  appointment_datetime: string;
  location?: string | null;
  notes?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | string;
}

interface CaregiverResponse {
  id: number;
  caregiver_email: string;
  caregiver_name?: string | null;
  relationship_type?: string | null;
  consent_granted: boolean;
  created_at: string;
}

const toDateOnly = (value: string): string => value.slice(0, 10);
const today = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const mapMedication = (medication: MedicationResponse): Medication => ({
  id: String(medication.id),
  name: medication.name,
  dosage: medication.dosage,
  frequency: medication.frequency,
  instructions: medication.instructions ?? undefined,
  is_active: medication.is_active,
});

const mapPrescription = (prescription: PrescriptionResponse): Prescription => ({
  id: String(prescription.id),
  name: prescription.filename,
  doctor: prescription.doctor_name ?? '',
  date: prescription.prescription_date,
  notes: prescription.notes ?? undefined,
  file_url: prescription.file_url ?? undefined,
});

const mapAppointment = (appointment: AppointmentResponse): Appointment => {
  const scheduledAt = new Date(appointment.appointment_datetime);
  return {
    id: String(appointment.id),
    doctor_name: appointment.doctor_name,
    specialty: appointment.specialty,
    hospital_clinic: appointment.location ?? '',
    date: toDateOnly(appointment.appointment_datetime),
    time: Number.isNaN(scheduledAt.getTime())
      ? ''
      : scheduledAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    status: appointment.status === 'scheduled' ? 'upcoming' : appointment.status as Appointment['status'],
    notes: appointment.notes ?? undefined,
  };
};

const mapCaregiver = (caregiver: CaregiverResponse): Caregiver => ({
  id: String(caregiver.id),
  email: caregiver.caregiver_email,
  name: caregiver.caregiver_name ?? '',
  relationship: caregiver.relationship_type ?? '',
  consent_granted: caregiver.consent_granted,
  added_at: toDateOnly(caregiver.created_at),
});

export const careSyncApi = {
  getMedications: async (): Promise<Medication[]> => {
    const response = await apiClient.get<MedicationResponse[]>('/api/v1/caresync/medications');
    return response.data.map(mapMedication);
  },

  addMedication: async (medication: Omit<Medication, 'id'>): Promise<Medication> => {
    const response = await apiClient.post<MedicationResponse>('/api/v1/caresync/medications', {
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: today(),
      instructions: medication.instructions,
    });
    return mapMedication(response.data);
  },

  toggleMedicationTaken: async (): Promise<never> => {
    throw new Error('Dose logging is not available in the connected care service.');
  },

  deleteMedication: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/api/v1/caresync/medications/${id}`);
    return true;
  },

  getPrescriptions: async (): Promise<Prescription[]> => {
    const response = await apiClient.get<PrescriptionResponse[]>('/api/v1/caresync/prescriptions');
    return response.data.map(mapPrescription);
  },

  addPrescription: async (prescription: Omit<Prescription, 'id'>): Promise<Prescription> => {
    const response = await apiClient.post<PrescriptionResponse>('/api/v1/caresync/prescriptions', {
      filename: prescription.name,
      doctor_name: prescription.doctor || undefined,
      prescription_date: prescription.date,
      notes: prescription.notes,
      file_url: prescription.file_url,
    });
    return mapPrescription(response.data);
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<AppointmentResponse[]>('/api/v1/caresync/appointments');
    return response.data.map(mapAppointment);
  },

  addAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    if (Number.isNaN(appointmentDate.getTime())) {
      throw new Error('Enter a valid appointment date and time.');
    }
    const response = await apiClient.post<AppointmentResponse>('/api/v1/caresync/appointments', {
      doctor_name: appointment.doctor_name,
      specialty: appointment.specialty,
      appointment_datetime: appointmentDate.toISOString(),
      location: appointment.hospital_clinic,
      notes: appointment.notes,
      status: 'scheduled',
    });
    return mapAppointment(response.data);
  },

  getCaregivers: async (): Promise<Caregiver[]> => {
    const response = await apiClient.get<CaregiverResponse[]>('/api/v1/caresync/caregivers');
    return response.data.map(mapCaregiver);
  },

  addCaregiver: async (email: string, name: string, relationship: string): Promise<Caregiver> => {
    const response = await apiClient.post<CaregiverResponse>('/api/v1/caresync/caregivers', {
      caregiver_email: email,
      caregiver_name: name,
      relationship_type: relationship,
      consent_granted: false,
    });
    return mapCaregiver(response.data);
  },

  toggleCaregiverConsent: async (id: string, consent: boolean): Promise<boolean> => {
    await apiClient.patch(`/api/v1/caresync/caregivers/${id}/consent`, {
      consent_granted: consent,
    });
    return true;
  },
};

import apiClient from './axios';
import { Medication, Prescription, Appointment, Caregiver } from '../types';

const defaultMedications: Medication[] = [
  {
    id: 'med_1',
    name: 'Metformin Hydrochloride',
    dosage: '500 mg',
    frequency: 'Twice daily after meals',
    time_of_day: 'morning',
    instructions: 'Take with food to prevent gastric discomfort',
    is_active: true,
    taken_today: true,
  },
  {
    id: 'med_2',
    name: 'Telmisartan',
    dosage: '40 mg',
    frequency: 'Once daily in morning',
    time_of_day: 'morning',
    instructions: 'Blood pressure maintenance',
    is_active: true,
    taken_today: true,
  },
  {
    id: 'med_3',
    name: 'Vitamin D3 Cholecalciferol',
    dosage: '60,000 IU',
    frequency: 'Once weekly on Sunday',
    time_of_day: 'morning',
    instructions: 'Take after a fatty meal or milk for absorption',
    is_active: true,
    taken_today: false,
  },
  {
    id: 'med_4',
    name: 'Ashwagandha Extract',
    dosage: '300 mg',
    frequency: 'Once daily before bedtime',
    time_of_day: 'night',
    instructions: 'Cortisol regulation and deep sleep support',
    is_active: true,
    taken_today: false,
  },
];

const defaultPrescriptions: Prescription[] = [
  {
    id: 'rx_1',
    name: 'Annual Preventive Health Evaluation',
    doctor: 'Dr. Priya Sharma, MD (Internal Medicine)',
    date: '2026-09-15',
    notes: 'HbA1c steady at 5.6%. Continue moderate aerobic activity and low GI diet.',
    file_url: 'https://aarogya360.ai/docs/rx_annual_2026.pdf',
  },
  {
    id: 'rx_2',
    name: 'Cardiology Follow-up & ECG Review',
    doctor: 'Dr. Rajesh Deshmukh, DM (Cardiology)',
    date: '2026-08-10',
    notes: 'Normal sinus rhythm. Blood pressure controlled at 118/76 mmHg.',
    file_url: 'https://aarogya360.ai/docs/rx_cardio_aug.pdf',
  },
  {
    id: 'rx_3',
    name: 'Dermatology & Vitamin Assessment',
    doctor: 'Dr. Ananya Ray, MD (Dermatology)',
    date: '2026-07-04',
    notes: 'Advised Vitamin D3 supplement and daily broad-spectrum SPF 50 sunscreen.',
  },
];

const defaultAppointments: Appointment[] = [
  {
    id: 'apt_1',
    doctor_name: 'Dr. Priya Sharma',
    specialty: 'Endocrinology & General Medicine',
    hospital_clinic: 'Apollo Health City, Jubilee Hills',
    date: '2026-10-24',
    time: '10:30 AM',
    status: 'upcoming',
    notes: 'Quarterly blood panel review and wellness metrics discussion.',
  },
  {
    id: 'apt_2',
    doctor_name: 'Dr. Vikram Malhotra',
    specialty: 'Ophthalmology',
    hospital_clinic: 'Centre For Sight Eye Institute',
    date: '2026-11-05',
    time: '03:15 PM',
    status: 'upcoming',
    notes: 'Routine digital eye strain and refraction check.',
  },
  {
    id: 'apt_3',
    doctor_name: 'Dr. Rajesh Deshmukh',
    specialty: 'Cardiology',
    hospital_clinic: 'Max Super Speciality Hospital',
    date: '2026-08-10',
    time: '11:00 AM',
    status: 'completed',
    notes: 'Annual treadmill test and lipid profile review completed with normal status.',
  },
];

const defaultCaregivers: Caregiver[] = [
  {
    id: 'cg_1',
    email: 'kavita.sharma@example.com',
    name: 'Kavita Sharma',
    relationship: 'Spouse / Primary Contact',
    consent_granted: true,
    added_at: '2026-01-15',
  },
  {
    id: 'cg_2',
    email: 'arjun.nair@example.com',
    name: 'Arjun Nair',
    relationship: 'Son / Emergency Contact',
    consent_granted: true,
    added_at: '2026-03-22',
  },
  {
    id: 'cg_3',
    email: 'dr.deshmukh_clinic@healthcare.in',
    name: 'Care Coordinator Max Hospital',
    relationship: 'Attending Physician Assistant',
    consent_granted: false,
    added_at: '2026-06-18',
  },
];

export const careSyncApi = {
  // Medications
  getMedications: async (): Promise<Medication[]> => {
    try {
      const response = await apiClient.get<Medication[]>('/api/caresync/medications');
      return response.data;
    } catch (error) {
      return defaultMedications;
    }
  },

  addMedication: async (medication: Omit<Medication, 'id'>): Promise<Medication> => {
    try {
      const response = await apiClient.post<Medication>('/api/caresync/medications', medication);
      return response.data;
    } catch (error) {
      const newMed: Medication = {
        ...medication,
        id: 'med_' + Date.now(),
        taken_today: false,
      };
      return newMed;
    }
  },

  toggleMedicationTaken: async (medId: string, taken: boolean): Promise<boolean> => {
    try {
      await apiClient.post(`/api/caresync/medications/${medId}/toggle-taken`, { taken });
      return true;
    } catch (error) {
      return true;
    }
  },

  deleteMedication: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/caresync/medications/${id}`);
      return true;
    } catch (error) {
      return true;
    }
  },

  // Prescriptions
  getPrescriptions: async (): Promise<Prescription[]> => {
    try {
      const response = await apiClient.get<Prescription[]>('/api/caresync/prescriptions');
      return response.data;
    } catch (error) {
      return defaultPrescriptions;
    }
  },

  addPrescription: async (data: Omit<Prescription, 'id'>): Promise<Prescription> => {
    try {
      const response = await apiClient.post<Prescription>('/api/caresync/prescriptions', data);
      return response.data;
    } catch (error) {
      return {
        ...data,
        id: 'rx_' + Date.now(),
      };
    }
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get<Appointment[]>('/api/caresync/appointments');
      return response.data;
    } catch (error) {
      return defaultAppointments;
    }
  },

  addAppointment: async (data: Omit<Appointment, 'id'>): Promise<Appointment> => {
    try {
      const response = await apiClient.post<Appointment>('/api/caresync/appointments', data);
      return response.data;
    } catch (error) {
      return {
        ...data,
        id: 'apt_' + Date.now(),
      };
    }
  },

  // Caregivers
  getCaregivers: async (): Promise<Caregiver[]> => {
    try {
      const response = await apiClient.get<Caregiver[]>('/api/caresync/caregivers');
      return response.data;
    } catch (error) {
      return defaultCaregivers;
    }
  },

  addCaregiver: async (email: string, name: string, relationship: string): Promise<Caregiver> => {
    try {
      const response = await apiClient.post<Caregiver>('/api/caresync/caregivers', {
        email,
        name,
        relationship,
        consent_granted: true,
      });
      return response.data;
    } catch (error) {
      return {
        id: 'cg_' + Date.now(),
        email,
        name,
        relationship,
        consent_granted: true,
        added_at: new Date().toISOString().split('T')[0],
      };
    }
  },

  toggleCaregiverConsent: async (id: string, consent: boolean): Promise<boolean> => {
    try {
      await apiClient.patch(`/api/caresync/caregivers/${id}/consent`, { consent_granted: consent });
      return true;
    } catch (error) {
      return true;
    }
  },
};

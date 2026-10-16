import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pill,
  FileText,
  Calendar,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  ExternalLink,
  X,
} from 'lucide-react';
import { careSyncApi } from '../api/caresync';
import { Medication, Prescription, Appointment, Caregiver } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

type TabKey = 'medications' | 'prescriptions' | 'appointments' | 'caregivers';
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const CareSync: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('medications');

  // Form modal states
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);
  const [showAddApt, setShowAddApt] = useState(false);
  const [showAddCg, setShowAddCg] = useState(false);

  // New item form states
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
  });

  const [newRx, setNewRx] = useState({
    name: '',
    doctor: '',
    date: today(),
    notes: '',
  });

  const [newApt, setNewApt] = useState({
    doctor_name: '',
    specialty: '',
    hospital_clinic: '',
    date: today(),
    time: '10:00',
    notes: '',
  });

  const [newCg, setNewCg] = useState({
    name: '',
    email: '',
    relationship: '',
  });

  // Queries
  const { data: medications, isLoading: medsLoading, isError: medsError } = useQuery({
    queryKey: ['medications'],
    queryFn: () => careSyncApi.getMedications(),
  });

  const { data: prescriptions, isLoading: rxLoading, isError: rxError } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => careSyncApi.getPrescriptions(),
  });

  const { data: appointments, isLoading: aptLoading, isError: aptError } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => careSyncApi.getAppointments(),
  });

  const { data: caregivers, isLoading: cgLoading, isError: cgError } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => careSyncApi.getCaregivers(),
  });

  // Mutations
  const addMedMutation = useMutation({
    mutationFn: (data: typeof newMed) =>
      careSyncApi.addMedication({ ...data, is_active: true }),
    onSuccess: () => {
      toast.success('Medication schedule saved.');
      setShowAddMed(false);
      setNewMed({ name: '', dosage: '', frequency: '', instructions: '' });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
    onError: () => toast.error('Could not save the medication schedule.'),
  });

  const deleteMedMutation = useMutation({
    mutationFn: (id: string) => careSyncApi.deleteMedication(id),
    onSuccess: () => {
      toast.success('Medication removed');
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
    onError: () => toast.error('Could not remove the medication.'),
  });

  const addRxMutation = useMutation({
    mutationFn: (data: typeof newRx) => careSyncApi.addPrescription(data),
    onSuccess: () => {
      toast.success('Prescription details saved. No file was uploaded.');
      setShowAddRx(false);
      setNewRx({ name: '', doctor: '', date: today(), notes: '' });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: () => toast.error('Could not save prescription details.'),
  });

  const addAptMutation = useMutation({
    mutationFn: (data: typeof newApt) =>
      careSyncApi.addAppointment({ ...data, status: 'upcoming' }),
    onSuccess: () => {
      toast.success('Appointment details saved to your care list. This does not book with a provider.');
      setShowAddApt(false);
      setNewApt({ doctor_name: '', specialty: '', hospital_clinic: '', date: today(), time: '10:00', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: () => toast.error('Could not save appointment details.'),
  });

  const addCgMutation = useMutation({
    mutationFn: (data: typeof newCg) =>
      careSyncApi.addCaregiver(data.email, data.name, data.relationship),
    onSuccess: () => {
      toast.success('Care circle contact saved. No invitation was sent.');
      setShowAddCg(false);
      setNewCg({ name: '', email: '', relationship: '' });
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
    onError: () => toast.error('Could not save the care circle contact.'),
  });

  const toggleConsentMutation = useMutation({
    mutationFn: ({ id, consent }: { id: string; consent: boolean }) =>
      careSyncApi.toggleCaregiverConsent(id, consent),
    onSuccess: () => {
      toast.success('Caregiver authorization updated');
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
    onError: () => toast.error('Could not update care circle consent.'),
  });

  return (
    <div className="space-y-8">
      {(medsError || rxError || aptError || cgError) && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Some care information could not be loaded. Check your connection and try again.
        </p>
      )}
      {/* Module Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              Care <span className="text-teal-600">Coordination</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Your care details
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Keep medication schedules, prescription details, appointment notes, and care circle contacts together.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80">
        <button
          onClick={() => setActiveTab('medications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'medications'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medications ({medications?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'prescriptions'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescriptions ({prescriptions?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments ({appointments?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('caregivers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'caregivers'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Caregivers & Consent ({caregivers?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: MEDICATIONS */}
      {activeTab === 'medications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Active Regimen</h2>
              <p className="text-xs text-slate-400">Medication schedules saved to your account</p>
            </div>
            <button
              onClick={() => setShowAddMed(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>
          </div>

          {medsLoading ? (
            <LoadingSpinner />
          ) : medsError ? (
            <p role="alert" className="text-sm text-rose-700">Medication schedules could not be loaded.</p>
          ) : !medications?.length ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No medication schedules have been saved.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications?.map((med) => (
                <div
                  key={med.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{med.name}</h3>
                          <span className="inline-block mt-0.5 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                            {med.dosage}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMedMutation.mutate(med.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{med.frequency}</span>
                      </div>
                      {med.instructions && (
                        <p className="text-slate-500 italic pl-5">{med.instructions}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Daily Status</span>
                    <span className="text-xs text-slate-500" title="Dose logging is not available in the connected care service.">
                      Dose logging unavailable
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Med Modal */}
          {showAddMed && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-base">Add New Medication</h3>
                  <button onClick={() => setShowAddMed(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newMed.name || !newMed.dosage) return;
                    addMedMutation.mutate(newMed);
                  }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Drug / Supplement Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Atorvastatin"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dosage</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 20 mg, 1 tablet"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Frequency</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Once daily after dinner"
                      value={newMed.frequency}
                      onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instructions / Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Avoid grapefruit, take with a full glass of water"
                      value={newMed.instructions}
                      onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddMed(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addMedMutation.isPending}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                    >
                      Save Medication
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Prescription Archive</h2>
              <p className="text-xs text-slate-400">Digital records from licensed medical practitioners</p>
            </div>
            <button
              onClick={() => setShowAddRx(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Prescription</span>
            </button>
          </div>

          {rxLoading ? (
            <LoadingSpinner />
          ) : rxError ? (
            <p role="alert" className="text-sm text-rose-700">Prescription records could not be loaded.</p>
          ) : !prescriptions?.length ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No prescription details have been saved.</p>
          ) : (
            <div className="space-y-3">
              {prescriptions?.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{rx.name}</h3>
                      <p className="text-xs text-teal-700 font-semibold">{rx.doctor}</p>
                      {rx.notes && (
                        <p className="text-xs text-slate-500 mt-1 max-w-xl">{rx.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {rx.date}
                    </span>
                    {rx.file_url ? (
                      <a
                        href={rx.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-colors"
                        title="View File"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 italic">Metadata Log</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Prescription Modal */}
          {showAddRx && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-base">Record Prescription</h3>
                  <button onClick={() => setShowAddRx(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newRx.name || !newRx.doctor) return;
                    addRxMutation.mutate(newRx);
                  }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prescription Title / Condition</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hypertension & Lipid Evaluation"
                      value={newRx.name}
                      onChange={(e) => setNewRx({ ...newRx, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prescribing Doctor</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ramesh Gupta, MD"
                      value={newRx.doctor}
                      onChange={(e) => setNewRx({ ...newRx, doctor: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prescription Date</label>
                    <input
                      type="date"
                      required
                      value={newRx.date}
                      onChange={(e) => setNewRx({ ...newRx, date: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor's Clinical Notes</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Blood pressure stabilized at 120/80. Repeat CBC in 6 months."
                      value={newRx.notes}
                      onChange={(e) => setNewRx({ ...newRx, notes: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddRx(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addRxMutation.isPending}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                    >
                      Save Prescription Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Appointment Details</h2>
              <p className="text-xs text-slate-400">Appointment details saved to your care list; no booking integration is connected.</p>
            </div>
            <button
              onClick={() => setShowAddApt(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Appointment</span>
            </button>
          </div>

          {aptLoading ? (
            <LoadingSpinner />
          ) : aptError ? (
            <p role="alert" className="text-sm text-rose-700">Appointment details could not be loaded.</p>
          ) : !appointments?.length ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No appointment details have been saved.</p>
          ) : (
            <div className="space-y-3">
              {appointments?.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm">{apt.doctor_name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                          {apt.specialty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {apt.hospital_clinic}
                      </p>
                      {apt.notes && (
                        <p className="text-xs text-slate-400 mt-1 italic">{apt.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">{apt.date}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{apt.time}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        apt.status === 'upcoming'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Appointment Modal */}
          {showAddApt && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-base">Schedule New Appointment</h3>
                  <button onClick={() => setShowAddApt(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newApt.doctor_name || !newApt.hospital_clinic) return;
                    addAptMutation.mutate(newApt);
                  }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Priya Sharma"
                      value={newApt.doctor_name}
                      onChange={(e) => setNewApt({ ...newApt, doctor_name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medical Specialty</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cardiology, Orthopedics, Endocrine"
                      value={newApt.specialty}
                      onChange={(e) => setNewApt({ ...newApt, specialty: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hospital or Clinic Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apollo Hospitals or Teleconsult"
                      value={newApt.hospital_clinic}
                      onChange={(e) => setNewApt({ ...newApt, hospital_clinic: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={newApt.date}
                        onChange={(e) => setNewApt({ ...newApt, date: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time</label>
                      <input
                        type="time"
                        required
                        value={newApt.time}
                        onChange={(e) => setNewApt({ ...newApt, time: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Appointment Purpose</label>
                    <input
                      type="text"
                      placeholder="e.g. Routine 6-month checkup, blood sugar review"
                      value={newApt.notes}
                      onChange={(e) => setNewApt({ ...newApt, notes: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddApt(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addAptMutation.isPending}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                    >
                      Save Appointment Details
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CAREGIVERS & CONSENT */}
      {activeTab === 'caregivers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Care Circle & Data Consent</h2>
              <p className="text-xs text-slate-400">Manage saved contacts and consent records. This screen does not send invitations.</p>
            </div>
            <button
              onClick={() => setShowAddCg(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Care Circle Contact</span>
            </button>
          </div>

          {cgLoading ? (
            <LoadingSpinner />
          ) : cgError ? (
            <p role="alert" className="text-sm text-rose-700">Care circle contacts could not be loaded.</p>
          ) : !caregivers?.length ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No care circle contacts have been saved.</p>
          ) : (
            <div className="space-y-3">
              {caregivers?.map((cg) => (
                <div
                  key={cg.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm">{cg.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {cg.relationship}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{cg.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Added on {cg.added_at}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {cg.consent_granted ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                      )}
                      <span className="text-xs font-bold text-slate-700">
                        {cg.consent_granted ? 'Consent recorded' : 'Consent not granted'}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cg.consent_granted}
                        onChange={(e) =>
                          toggleConsentMutation.mutate({
                            id: cg.id,
                            consent: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Caregiver Modal */}
          {showAddCg && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-base">Add Care Circle Contact</h3>
                  <button onClick={() => setShowAddCg(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCg.email || !newCg.name) return;
                    addCgMutation.mutate(newCg);
                  }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kavita Sharma"
                      value={newCg.name}
                      onChange={(e) => setNewCg({ ...newCg, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="kavita@example.com"
                      value={newCg.email}
                      onChange={(e) => setNewCg({ ...newCg, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Relationship</label>
                    <select
                      value={newCg.relationship}
                      required
                      onChange={(e) => setNewCg({ ...newCg, relationship: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                    >
                      <option value="">Choose a relationship</option>
                      <option value="Spouse / Partner">Spouse / Partner</option>
                      <option value="Child / Daughter / Son">Child / Daughter / Son</option>
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Attending Nurse / Coordinator">Attending Nurse / Coordinator</option>
                      <option value="Friend / Emergency Contact">Friend / Emergency Contact</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    No invitation is sent. Consent remains off until you explicitly enable access for this contact.
                  </p>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddCg(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addCgMutation.isPending}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                    >
                      Save Contact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareSync;

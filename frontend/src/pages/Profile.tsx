import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  User,
  Mail,
  Phone,
  Globe,
  Save,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const Profile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState<number | ''>(user?.age ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [language, setLanguage] = useState(user?.language ?? '');
  const [saveError, setSaveError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    try {
      await updateProfile({
        name,
        age: age === '' ? undefined : Number(age),
        gender: gender || undefined,
        phone,
        language,
      });
    } catch {
      setSaveError('Your profile changes could not be saved.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
          Personal <span className="text-teal-600">Profile & Settings</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and update the account details and preferences you have provided.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Profile Overview Card */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-teal-600/20">
                {name ? name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>

            <h2 className="mt-4 font-bold text-lg text-slate-800">{name}</h2>
            {user?.email && <p className="text-xs text-slate-400">{user.email}</p>}

            <div className="w-full mt-6 pt-5 border-t border-slate-100 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Profile details</span>
                <span className="font-bold text-slate-700">From your account</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Health information</span>
                <span className="font-bold text-slate-500">Not connected</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Care Circle</span>
                <span className="font-bold text-slate-700">Manage in Care Coordination</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form: Edit Profile Information */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Edit Demographics & Preferences</h2>
              <p className="text-xs text-slate-400">Update the details and preferences saved in your account.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as typeof gender)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 bg-slate-50/50"
                >
                  <option value="">Choose if you wish</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Add a phone number"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Language Preference
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 bg-slate-50/50"
                  >
                    <option value="">Choose a language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                  </select>
                </div>
              </div>
            </div>

            {saveError && <p role="alert" className="text-sm text-rose-700">{saveError}</p>}

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

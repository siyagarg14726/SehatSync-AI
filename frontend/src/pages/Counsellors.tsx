import React, { useEffect, useMemo, useState } from 'react';
import { HeartHandshake, LockKeyhole, Search, Send, ShieldCheck } from 'lucide-react';

type ConsultationMode = 'in-person' | 'online' | 'either';

interface CounsellorProfile {
  id: string;
  name: string;
  specialty: string;
  location: string;
  languages: string[];
  qualifications: string[];
  modes: Exclude<ConsultationMode, 'either'>[];
  verificationSource: string;
}

interface CallbackDraft {
  id: string;
  contact: string;
  preferredDate: string;
  preferredTime: string;
  status: 'local-draft';
}

const counsellors: CounsellorProfile[] = [];
const sessionKey = 'sehatsync-counsellor-callback-drafts';

export const Counsellors: React.FC = () => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');
  const [qualification, setQualification] = useState('');
  const [mode, setMode] = useState<ConsultationMode>('either');
  const [contact, setContact] = useState('');
  const [contactError, setContactError] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [drafts, setDrafts] = useState<CallbackDraft[]>([]);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(sessionKey);
      setDrafts(saved ? JSON.parse(saved) as CallbackDraft[] : []);
    } catch {
      setStorageError(true);
    }
  }, []);

  const filteredCounsellors = useMemo(
    () =>
      counsellors.filter((profile) => {
        const searchable = `${profile.name} ${profile.specialty} ${profile.location} ${profile.languages.join(' ')} ${profile.qualifications.join(' ')}`
          .toLowerCase();
        return (
          searchable.includes(search.trim().toLowerCase()) &&
          (!location || profile.location.toLowerCase().includes(location.toLowerCase())) &&
          (!language || profile.languages.some((item) => item.toLowerCase().includes(language.toLowerCase()))) &&
          (!qualification || profile.qualifications.some((item) => item.toLowerCase().includes(qualification.toLowerCase()))) &&
          (mode === 'either' || profile.modes.includes(mode))
        );
      }),
    [search, location, language, qualification, mode],
  );

  const saveCallbackDraft = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = contact.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const validPhone = /^\+?[\d\s().-]{7,}$/.test(value);
    if (!validEmail && !validPhone) {
      setContactError('Enter a valid email address or phone number.');
      return;
    }
    setContactError('');
    const draft: CallbackDraft = {
      id: `${Date.now()}`,
      contact: value,
      preferredDate,
      preferredTime,
      status: 'local-draft',
    };
    const updatedDrafts = [draft, ...drafts];
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      setContact('');
      setPreferredDate('');
      setPreferredTime('');
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-violet-800 to-teal-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-100">
          <HeartHandshake className="h-4 w-4" /> Mental wellness
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Counsellor connection</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-50">
          Find qualified support by location, language, credentials, and consultation mode. A verified professional directory is not connected yet.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Find a counsellor</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Search counsellors</span>
            <Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or specialty" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          <label>
            <span className="sr-only">Filter by location</span>
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          <label>
            <span className="sr-only">Filter by language</span>
            <input value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="Language" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          <label>
            <span className="sr-only">Filter by professional qualification</span>
            <input value={qualification} onChange={(event) => setQualification(event.target.value)} placeholder="Qualification" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          <label>
            <span className="sr-only">Consultation mode</span>
            <select value={mode} onChange={(event) => setMode(event.target.value as ConsultationMode)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100">
              <option value="either">Any mode</option>
              <option value="in-person">In person</option>
              <option value="online">Online</option>
            </select>
          </label>
        </div>

        {filteredCounsellors.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {filteredCounsellors.map((profile) => (
              <article key={profile.id} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900">{profile.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{profile.specialty} · {profile.location} · {profile.languages.join(', ')}</p>
                <p className="mt-2 text-sm text-slate-600">{profile.qualifications.join(', ')}</p>
                <p className="mt-2 text-xs text-slate-500">Verified by: {profile.verificationSource}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-teal-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Verified counsellor profiles are not connected yet</h3>
            <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-slate-600">
              Your filters are ready, but we do not have verified profiles to show. No names, qualifications, languages, ratings, or availability are being invented.
            </p>
            <p className="mt-1 text-xs text-slate-500">{filteredCounsellors.length} verified profiles match.</p>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveCallbackDraft} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Prepare a callback request</h2>
            <p className="mt-1 text-sm text-slate-600">This creates a private draft in this browser tab only. It is not sent to a counsellor or appointment service.</p>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Email or phone for a callback
            <input required value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="email" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          {contactError && <p role="alert" className="text-sm text-rose-700">{contactError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Preferred date
              <input required type="date" min={new Date().toISOString().slice(0, 10)} value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Preferred time
              <input required type="time" value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
            </label>
          </div>
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
            Draft contact details stay in session storage for this tab and are cleared when the tab session ends. Do not enter health details here.
          </p>
          {storageError && <p role="alert" className="text-sm text-rose-700">This browser could not save the draft. Check its storage settings and try again.</p>}
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2">
            <Send className="h-4 w-4" /> Save local draft
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Your request drafts</h2>
          <p className="mt-1 text-sm text-slate-600">These are not confirmed appointments. No contact has been made.</p>
          {drafts.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No callback drafts saved in this tab.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {drafts.map((draft) => (
                <li key={draft.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-950">Saved locally · not sent</p>
                  <p className="mt-1 text-sm text-slate-700">{draft.contact}</p>
                  <p className="mt-1 text-xs text-slate-600">Preferred: {draft.preferredDate} at {draft.preferredTime}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            Confirmed consultations from connected services will be listed separately in Care Coordination.
          </div>
        </section>
      </section>
    </div>
  );
};

export default Counsellors;

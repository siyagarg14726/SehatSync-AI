import React, { useMemo, useState } from 'react';
import { List, Map, MapPin, Navigation, Search, ShieldAlert } from 'lucide-react';

type ProviderCategory = 'hospital' | 'clinic' | 'pharmacy' | 'laboratory' | 'counsellor';

interface CareProvider {
  id: string;
  name: string;
  category: ProviderCategory;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  verificationSource?: string;
}

const providers: CareProvider[] = [];
const categories: Array<{ value: ProviderCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All care' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'clinic', label: 'Clinics' },
  { value: 'pharmacy', label: 'Pharmacies' },
  { value: 'laboratory', label: 'Diagnostic labs' },
  { value: 'counsellor', label: 'Mental wellness' },
];

export const NearbyCare: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProviderCategory | 'all'>('all');
  const [distance, setDistance] = useState('any');
  const [locationText, setLocationText] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');

  const visibleProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const matchesCategory = category === 'all' || provider.category === category;
        const matchesSearch = `${provider.name} ${provider.category} ${provider.address}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [category, search],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-700 p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm font-semibold text-teal-100">Care close to you</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Nearby Care</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50">
          Search for hospitals, clinics, pharmacies, diagnostic labs, and mental wellness support.
          Provider listings will appear here when a verified directory is connected.
        </p>
      </header>

      <section aria-label="Search nearby care" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <span className="sr-only">Search by provider name or specialty</span>
            <Search aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or specialty"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled
              title="Location search is unavailable until a provider directory is connected."
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-400"
            >
              <Navigation className="h-4 w-4" />
              Location unavailable
            </button>
            <label className="sr-only" htmlFor="location-search">City or postcode</label>
            <input
              id="location-search"
              value={locationText}
              onChange={(event) => setLocationText(event.target.value)}
              placeholder="City or postcode"
              className="min-w-36 rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>
        <p className="mt-2 min-h-5 text-xs text-slate-500">
          Location is not requested because no provider directory is connected. Search by city or postcode when listings become available.
        </p>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Provider category">
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={category === item.value}
                onClick={() => setCategory(item.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  category === item.value
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="distance-filter" className="text-xs font-medium text-slate-600">Distance</label>
            <select
              id="distance-filter"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
              disabled
              title="Distance filtering will be available when a verified provider directory is connected."
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700"
            >
              <option value="any">Any distance</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
            </select>
            <span className="sr-only">Distance filtering is unavailable until provider coordinates are connected.</span>
            <button type="button" disabled title="Distance sorting requires verified provider coordinates." className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-400">
              Sort by distance
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-1 rounded-xl bg-slate-100 p-1" aria-label="Results view">
          <button
            type="button"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${view === 'list' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}
          >
            <List className="h-4 w-4" /> List
          </button>
          <button
            type="button"
            aria-pressed={view === 'map'}
            onClick={() => setView('map')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${view === 'map' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}
          >
            <Map className="h-4 w-4" /> Map
          </button>
        </div>
      </section>

      {visibleProviders.length > 0 ? (
        <section aria-label="Care providers" className={view === 'map' ? 'min-h-72 rounded-3xl border border-slate-200 bg-white p-6' : 'grid gap-4 md:grid-cols-2'}>
          {visibleProviders.map((provider) => (
            <article key={provider.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                <div>
                  <h2 className="font-semibold text-slate-900">{provider.name}</h2>
                  <p className="mt-1 text-sm capitalize text-slate-600">{provider.category} · {provider.address}</p>
                  {provider.verificationSource && <p className="mt-2 text-xs text-slate-500">Source: {provider.verificationSource}</p>}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <MapPin className="mx-auto h-9 w-9 text-teal-700" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            {view === 'map' ? 'Map view is waiting for verified listings' : 'Verified provider listings are not connected yet'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            {locationText.trim()
              ? `There are no verified listings available for ${locationText.trim()} yet.`
              : 'Your search and filters are ready, but no provider source is connected. We will not show unverified names, addresses, phone numbers, ratings, or availability.'}
          </p>
          <p className="mt-2 text-xs text-slate-500">Showing {visibleProviders.length} verified results.</p>
        </section>
      )}

      <aside className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <h2 className="text-sm font-semibold">Need urgent help?</h2>
          <p className="mt-1 text-sm leading-5">
            SehatSync is not an emergency response service. If someone may be in immediate danger, contact your local emergency services or go to the nearest emergency department.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default NearbyCare;

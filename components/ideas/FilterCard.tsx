"use client";

import { useLanguage, ZH_TAGS, ZH_VIBES, ZH_TIMES, ZH_BUDGETS, ZH_NEIGHBOURHOODS } from "@/app/lib/i18n";
import { NEIGHBOURHOODS, BUDGETS, VIBES, TIMES, INTEREST_CATEGORIES, CATEGORY_KEYS } from "@/app/ideas/constants";

interface Props {
  neighbourhood: string;
  budget: string;
  vibe: string;
  timeOfDay: string;
  interests: string[];
  showInterests: boolean;
  loading: boolean;
  setNeighbourhood: (v: string) => void;
  setBudget: (v: string) => void;
  setVibe: (v: string) => void;
  setTimeOfDay: (v: string) => void;
  setShowInterests: (fn: (prev: boolean) => boolean) => void;
  toggleInterest: (i: string) => void;
  isItemMismatch: (i: string) => boolean;
  onSearch: () => void;
}

export default function FilterCard({
  neighbourhood, budget, vibe, timeOfDay, interests, showInterests, loading,
  setNeighbourhood, setBudget, setVibe, setTimeOfDay, setShowInterests,
  toggleInterest, isItemMismatch, onSearch,
}: Props) {
  const { t, lang } = useLanguage();
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-6 sm:mb-8">
      {/* Dark header */}
      <div className="bg-gradient-to-r from-gray-950 to-gray-800 px-4 sm:px-6 py-4 flex items-center gap-2">
        <span className="text-white/50 text-base">⚙</span>
        <span className="text-sm font-semibold text-white tracking-wide">{t.filters}</span>
      </div>

      <div className="bg-white p-4 sm:p-6">
        {/* Neighbourhood */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t.neighbourhood}</label>
          <div className="flex flex-wrap gap-2">
            {NEIGHBOURHOODS.map((n) => (
              <button
                key={n}
                onClick={() => setNeighbourhood(n)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  neighbourhood === n
                    ? "bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {lang === "zh" ? (ZH_NEIGHBOURHOODS[n] ?? n) : n}
              </button>
            ))}
          </div>
        </div>

        {/* Budget / Vibe / Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {([
            { label: t.budget,   value: budget,    setter: setBudget,    options: BUDGETS, map: ZH_BUDGETS },
            { label: t.vibe,     value: vibe,      setter: setVibe,      options: VIBES,   map: ZH_VIBES  },
            { label: t.timeOfDay, value: timeOfDay, setter: setTimeOfDay, options: TIMES,  map: ZH_TIMES  },
          ] as const).map(({ label, value, setter, options, map }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
              <div className="relative">
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#be3a4a]/30 focus:border-[#be3a4a] transition-colors"
                >
                  {options.map((o) => (
                    <option key={o} value={o}>{lang === "zh" ? ((map as Record<string, string>)[o] ?? o) : o}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interests */}
        <div className="mb-6">
          <button
            onClick={() => setShowInterests((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <span className="text-xs">{showInterests ? "▾" : "▸"}</span>
            <span className="uppercase tracking-widest text-xs">{t.interests}</span>
            {interests.length > 0 && (
              <span className="bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white rounded-full px-2 py-0.5 text-xs font-bold">
                {interests.length}
              </span>
            )}
          </button>
          {showInterests && (
            <div className="space-y-4">
              {INTEREST_CATEGORIES.map(({ label, items }, ci) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    {t[CATEGORY_KEYS[ci]] ?? label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((i) => {
                      const mismatch = isItemMismatch(i);
                      const selected = interests.includes(i);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleInterest(i)}
                          title={mismatch ? "Doesn't fit your current budget or time" : undefined}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            selected
                              ? "bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white shadow-sm"
                              : mismatch
                              ? "bg-gray-50 text-gray-300 cursor-not-allowed opacity-40"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {lang === "zh" ? (ZH_TAGS[i] ?? i) : i}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onSearch}
          disabled={loading}
          className="bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.finding}
            </>
          ) : t.findSpots}
        </button>
      </div>
    </div>
  );
}

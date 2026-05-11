"use client";

import { useLanguage } from "@/app/lib/i18n";
import type { Venue } from "@/app/ideas/types";

interface Props {
  venue: Venue;
  schedDate: string;
  schedTime: string;
  schedNotes: string;
  setSchedDate: (v: string) => void;
  setSchedTime: (v: string) => void;
  setSchedNotes: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ScheduleModal({
  venue, schedDate, schedTime, schedNotes,
  setSchedDate, setSchedTime, setSchedNotes,
  onClose, onSubmit,
}: Props) {
  const { t } = useLanguage();
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{t.addToSchedule}</h2>
        <p className="text-sm text-gray-500 mb-5">{venue.name}</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{t.dateLabel} *</label>
              <input
                required
                type="date"
                value={schedDate}
                onChange={(e) => setSchedDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">{t.timeLabel}</label>
              <input
                type="time"
                value={schedTime}
                onChange={(e) => setSchedTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">{t.notesLabel}</label>
            <textarea
              value={schedNotes}
              onChange={(e) => setSchedNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#be3a4a] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#a3303f] transition-colors"
            >
              {t.addToSchedule}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

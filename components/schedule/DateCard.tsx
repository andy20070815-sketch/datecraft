"use client";

import { useLanguage } from "@/app/lib/i18n";
import type { ScheduledDate } from "@/app/lib/schedule";
import { STATUS_COLORS, formatDate, formatTime, buildGCalUrl } from "@/app/schedule/constants";

interface Props {
  d: ScheduledDate;
  cancelId: string | null;
  setCancelId: (id: string | null) => void;
  onStatusCycle: (id: string, status: ScheduledDate["status"]) => void;
  onCancel: (id: string) => void;
}

const LEFT_BORDER: Record<ScheduledDate["status"], string> = {
  planned:   "border-l-amber-400",
  confirmed: "border-l-[#be3a4a]",
  completed: "border-l-gray-200",
};

export default function DateCard({ d, cancelId, setCancelId, onStatusCycle, onCancel }: Props) {
  const { t } = useLanguage();
  const { month, day } = formatDate(d.date);
  const statusLabel: Record<ScheduledDate["status"], string> = {
    planned: t.planned, confirmed: t.confirmed, completed: t.completed,
  };
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${LEFT_BORDER[d.status]} p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow print-card`}>
      <div className="flex gap-3 sm:gap-5">
        <div className="text-center min-w-[44px]">
          <div className="text-xs font-semibold text-gray-400 uppercase">{month}</div>
          <div className="text-2xl font-bold text-gray-900">{day}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl text-gray-900 mb-1">{d.title}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2 flex-wrap">
            {d.time && <span>🕐 {formatTime(d.time)}</span>}
            {d.venueName && <span>📍 {d.venueName}</span>}
          </div>
          {d.address && <p className="text-xs text-gray-400 mb-2">{d.address}</p>}
          <div className="flex gap-2 flex-wrap mb-3">
            <button
              onClick={() => onStatusCycle(d.id, d.status)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize transition-colors hover:opacity-80 no-print ${STATUS_COLORS[d.status]}`}
            >
              {statusLabel[d.status]}
            </button>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold hidden print:inline-block ${STATUS_COLORS[d.status]}`}>
              {statusLabel[d.status]}
            </span>
          </div>
          {d.notes && (
            <p className="text-sm text-gray-600 flex gap-1.5 mb-3 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              <span className="text-[#be3a4a] shrink-0">✦</span>{d.notes}
            </p>
          )}
          <div className="flex items-center gap-3 sm:gap-4 no-print flex-wrap">
            {d.mapsLink && (
              <a href={d.mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-[#be3a4a] font-medium hover:underline">
                {t.viewOnMaps}
              </a>
            )}
            {d.date && (
              <a href={buildGCalUrl(d)} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-gray-500 font-medium hover:text-[#be3a4a] transition-colors">
                📅 {t.addToGCal}
              </a>
            )}
            {cancelId === d.id ? (
              <span className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-gray-500">{t.removeConfirm}</span>
                <button onClick={() => onCancel(d.id)} className="text-red-500 font-medium hover:underline">{t.yesRemove}</button>
                <button onClick={() => setCancelId(null)} className="text-gray-400 hover:underline">{t.keep}</button>
              </span>
            ) : (
              <button onClick={() => setCancelId(d.id)} className="text-xs sm:text-sm text-gray-400 hover:text-red-400 transition-colors">
                {t.cancelDate}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

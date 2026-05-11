"use client";

import { useLanguage } from "@/app/lib/i18n";
import type { Venue } from "@/app/ideas/types";

interface Props {
  v: Venue;
  isAdded: boolean;
  isLoggedIn: boolean;
  onScheduleClick: () => void;
}

export default function VenueCard({ v, isAdded, isLoggedIn, onScheduleClick }: Props) {
  const { t, lang } = useLanguage();
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      {/* Photo with gradient overlay — name + rating live on the image */}
      {v.photo ? (
        <div className="relative h-52 overflow-hidden">
          <img src={v.photo} alt={v.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            <h3 className="font-serif text-xl text-white drop-shadow">{v.name}</h3>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {v.rating && (
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  ★ {v.rating}
                </span>
              )}
              {v.price_level && (
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {"$".repeat(v.price_level)}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* No photo fallback header */
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-5 py-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-white">{v.name}</h3>
          <div className="flex items-center gap-1.5">
            {v.rating && (
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                ★ {v.rating}
              </span>
            )}
            {v.price_level && (
              <span className="text-white/70 text-sm">{"$".repeat(v.price_level)}</span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-5">
        <p className="text-sm text-gray-500 mb-3">📍 {v.address}</p>
        {v.tip && (
          <p className="text-sm text-gray-700 mb-4 flex gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
            <span className="text-[#be3a4a] shrink-0 mt-0.5">✦</span>
            {v.tip}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={v.maps_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#be3a4a] font-medium hover:underline"
          >
            {t.viewOnMaps}
          </a>
          {v.website && (
            <a
              href={v.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1 hover:border-[#be3a4a] hover:text-[#be3a4a] transition-colors"
            >
              🔗 {lang === "zh" ? "訂位 / 官網" : "Reserve"}
            </a>
          )}
          {isAdded ? (
            <span className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              ✓ {t.added}
            </span>
          ) : (
            <button
              onClick={onScheduleClick}
              className="text-sm font-semibold text-white bg-gradient-to-r from-[#be3a4a] to-[#e05d45] px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity shadow-sm"
            >
              {isLoggedIn ? t.scheduleBtn : t.signIn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

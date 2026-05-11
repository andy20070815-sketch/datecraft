"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  subscribeToSchedule, addToSchedule, removeFromSchedule, updateStatus,
  type ScheduledDate,
} from "../lib/schedule";
import { subscribeToCouple, type CoupleInfo } from "../lib/couple";
import { useLanguage } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import { FEATURED_SPOTS, STATUS_NEXT, EMPTY, type FormState } from "./constants";
import CoupleSyncPanel from "@/components/schedule/CoupleSyncPanel";
import DateCard from "@/components/schedule/DateCard";
import AddDateModal from "@/components/schedule/AddDateModal";
import { formatDate, formatTime } from "./constants";

type Filter = "all" | ScheduledDate["status"];

export default function SchedulePage() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading, signIn } = useAuth();

  const [dates, setDates]         = useState<ScheduledDate[]>([]);
  const [couple, setCouple]       = useState<CoupleInfo | null>(null);
  const [filter, setFilter]       = useState<Filter>("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState<FormState>(EMPTY);
  const [cancelId, setCancelId]   = useState<string | null>(null);
  const [shareMsg, setShareMsg]   = useState("");

  useEffect(() => {
    if (!user) return;
    return subscribeToCouple(user, setCouple);
  }, [user]);

  useEffect(() => {
    if (!user) { setDates([]); return; }
    return subscribeToSchedule(user, couple?.id ?? null, setDates);
  }, [user, couple?.id]);

  const filtered = filter === "all" ? dates : dates.filter((d) => d.status === filter);
  const upcoming = dates.filter((d) => d.status !== "completed").length;
  const statusLabel: Record<ScheduledDate["status"], string> = {
    planned: t.planned, confirmed: t.confirmed, completed: t.completed,
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await addToSchedule(user, couple?.id ?? null, form);
    setForm(EMPTY);
    setShowModal(false);
  }
  async function handleCancel(id: string) {
    if (!user) return;
    await removeFromSchedule(user, couple?.id ?? null, id);
    setCancelId(null);
  }
  async function handleStatusCycle(id: string, current: ScheduledDate["status"]) {
    if (!user) return;
    await updateStatus(user, couple?.id ?? null, id, STATUS_NEXT[current]);
  }

  function handleShare() {
    if (dates.length === 0) return;
    const text = dates.map((d) => {
      const { month, day } = formatDate(d.date);
      const time = d.time ? ` · ${formatTime(d.time)}` : "";
      const venue = d.venueName ? ` @ ${d.venueName}` : "";
      return `${day} ${month}${time} — ${d.title}${venue}`;
    }).join("\n");
    const header = lang === "zh" ? "我的約會行程 via DateCraft\n\n" : "My Date Schedule via DateCraft\n\n";
    navigator.clipboard.writeText(header + text).then(() => {
      setShareMsg(t.shareSuccess);
      setTimeout(() => setShareMsg(""), 2500);
    });
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#be3a4a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d0408] via-[#2a0e1c] to-[#7a1f30] min-h-[80vh] flex items-center justify-center px-4">
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-5">♥</div>
          <h1 className="font-serif text-5xl sm:text-6xl text-white mb-4">{t.yourSchedule}</h1>
          <p className="text-white/70 mb-8 max-w-xs mx-auto text-base font-medium leading-relaxed">{t.signInPrompt}</p>
          <button onClick={signIn} className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-lg">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.signIn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d0408] via-[#2a0e1c] to-[#7a1f30] px-4 py-12 sm:py-16 no-print">
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl sm:text-6xl text-white mb-3">{t.yourSchedule}</h1>
              <p className="text-white/70 text-base font-medium leading-relaxed">
                {upcoming > 0 ? `${upcoming} ${t.upcoming} · ` : ""}
                {dates.length === 0 ? t.noSchedule : `${dates.length} ${lang === "zh" ? "共" : "total"}`}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/ideas" className="border border-white/30 text-white/80 px-4 py-2.5 rounded-full font-medium text-sm hover:bg-white/10 transition-colors">
                {t.browseIdeas}
              </Link>
              {dates.length > 0 && (
                <>
                  <button onClick={handleShare} className="border border-white/30 text-white/80 px-4 py-2.5 rounded-full font-medium text-sm hover:bg-white/10 transition-colors relative">
                    {t.share}
                    {shareMsg && (
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-green-600 whitespace-nowrap bg-white border border-green-200 rounded-full px-2 py-0.5">
                        {shareMsg}
                      </span>
                    )}
                  </button>
                  <button onClick={() => window.print()} className="border border-white/30 text-white/80 px-4 py-2.5 rounded-full font-medium text-sm hover:bg-white/10 transition-colors">
                    {t.exportPdf}
                  </button>
                </>
              )}
              <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg">
                {t.newDate}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <CoupleSyncPanel user={user} couple={couple} />

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8 no-print">
          {(["all", "planned", "confirmed", "completed"] as const).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === tab
                  ? "bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}>
              {tab === "all" ? (lang === "zh" ? "全部" : "All") : statusLabel[tab as ScheduledDate["status"]]}
            </button>
          ))}
        </div>

        {/* Date cards */}
        <div className="flex flex-col gap-4">
          {filtered.map((d) => (
            <DateCard
              key={d.id}
              d={d}
              cancelId={cancelId}
              setCancelId={setCancelId}
              onStatusCycle={handleStatusCycle}
              onCancel={handleCancel}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div>
            {/* Empty state */}
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🗓</div>
              <p className="text-xl font-bold text-gray-800 mb-1">{t.noSchedule}</p>
              <p className="text-sm text-gray-400 mb-6">
                {lang === "zh" ? "先看看這些熱門地點找靈感吧" : "Get inspired by these popular Taipei spots"}
              </p>
              <Link
                href="/ideas"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-sm"
              >
                {lang === "zh" ? "找約會點子" : "Find date ideas"} →
              </Link>
            </div>

            {/* Recommended spots */}
            <div className="mt-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest shrink-0">
                  {lang === "zh" ? "精選約會地點" : "Recommended Spots"}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FEATURED_SPOTS.map((spot) => (
                  <a
                    key={spot.name.en}
                    href={spot.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block group"
                  >
                    {/* Dark header with emoji + name */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-4 flex items-center gap-3">
                      <span className="text-4xl shrink-0">{spot.emoji}</span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base leading-snug group-hover:text-white/80 transition-colors">
                          {lang === "zh" ? spot.name.zh : spot.name.en}
                        </h3>
                        <p className="text-xs text-[#e05d45] font-semibold mt-0.5">
                          {lang === "zh" ? spot.area.zh : spot.area.en}
                        </p>
                      </div>
                    </div>
                    {/* White content */}
                    <div className="bg-white px-4 py-3">
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                        {lang === "zh" ? spot.desc.zh : spot.desc.en}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(lang === "zh" ? spot.tags.zh : spot.tags.en).map((tag) => (
                          <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <AddDateModal
            form={form}
            setForm={setForm}
            onSubmit={handleAdd}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}

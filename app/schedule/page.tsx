"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSchedule, addToSchedule, removeFromSchedule, updateStatus, type ScheduledDate } from "../lib/schedule";
import { useLanguage } from "../lib/i18n";

type Filter = "all" | ScheduledDate["status"];

const STATUS_COLORS: Record<ScheduledDate["status"], string> = {
  planned:   "bg-amber-100 text-amber-700",
  confirmed: "bg-rose-100 text-[#be3a4a]",
  completed: "bg-gray-100 text-gray-500",
};

const STATUS_NEXT: Record<ScheduledDate["status"], ScheduledDate["status"]> = {
  planned: "confirmed", confirmed: "completed", completed: "planned",
};

function formatDate(iso: string) {
  if (!iso) return { month: "—", day: "—" };
  const d = new Date(iso + "T00:00:00");
  return { month: d.toLocaleString("en", { month: "short" }).toUpperCase(), day: d.getDate() };
}

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

interface FormState {
  title: string; venueName: string; address: string;
  mapsLink: string; date: string; time: string; notes: string;
}
const EMPTY: FormState = { title: "", venueName: "", address: "", mapsLink: "", date: "", time: "", notes: "" };

export default function SchedulePage() {
  const { t, lang } = useLanguage();
  const [dates, setDates]       = useState<ScheduledDate[]>([]);
  const [filter, setFilter]     = useState<Filter>("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState<FormState>(EMPTY);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => { setDates(getSchedule()); }, []);

  const filtered = filter === "all" ? dates : dates.filter((d) => d.status === filter);
  const upcoming = dates.filter((d) => d.status !== "completed").length;

  const statusLabel: Record<ScheduledDate["status"], string> = {
    planned: t.planned, confirmed: t.confirmed, completed: t.completed,
  };

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    addToSchedule(form);
    setDates(getSchedule());
    setForm(EMPTY);
    setShowModal(false);
  }

  function handleCancel(id: string) {
    removeFromSchedule(id);
    setDates(getSchedule());
    setCancelId(null);
  }

  function handleStatusCycle(id: string, current: ScheduledDate["status"]) {
    updateStatus(id, STATUS_NEXT[current]);
    setDates(getSchedule());
  }

  function handleExportPdf() {
    window.print();
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">{t.yourSchedule}</h1>
          <p className="text-gray-500">
            {upcoming > 0 ? `${upcoming} ${t.upcoming} · ` : ""}
            {dates.length === 0 ? t.noSchedule : `${dates.length} ${lang === "zh" ? t.upcoming.replace("個即將到來","共") : "total"}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end no-print">
          <Link href="/ideas" className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-full font-medium text-sm hover:border-gray-400 transition-colors">
            {t.browseIdeas}
          </Link>
          {dates.length > 0 && (
            <>
              <button onClick={handleShare} className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-full font-medium text-sm hover:border-gray-400 transition-colors relative">
                {t.share}
                {shareMsg && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-green-600 whitespace-nowrap bg-white border border-green-200 rounded-full px-2 py-0.5">
                    {shareMsg}
                  </span>
                )}
              </button>
              <button onClick={handleExportPdf} className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-full font-medium text-sm hover:border-gray-400 transition-colors">
                {t.exportPdf}
              </button>
            </>
          )}
          <button onClick={() => setShowModal(true)} className="bg-[#be3a4a] text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-[#a3303f] transition-colors">
            {t.newDate}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-8 no-print">
        {(["all", "planned", "confirmed", "completed"] as const).map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === tab ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}>
            {tab === "all" ? (lang === "zh" ? "全部" : "all") : statusLabel[tab as ScheduledDate["status"]]}
          </button>
        ))}
      </div>

      {/* Date cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((d) => {
          const { month, day } = formatDate(d.date);
          return (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm print-card">
              <div className="flex gap-5">
                <div className="text-center min-w-[44px]">
                  <div className="text-xs font-semibold text-gray-400 uppercase">{month}</div>
                  <div className="text-2xl font-bold text-gray-900">{day}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{d.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-2 flex-wrap">
                    {d.time && <span>🕐 {formatTime(d.time)}</span>}
                    {d.venueName && <span>📍 {d.venueName}</span>}
                  </div>
                  {d.address && <p className="text-xs text-gray-400 mb-2">{d.address}</p>}
                  <div className="flex gap-2 flex-wrap mb-3">
                    <button onClick={() => handleStatusCycle(d.id, d.status)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition-colors hover:opacity-80 no-print ${STATUS_COLORS[d.status]}`}>
                      {statusLabel[d.status]}
                    </button>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium hidden print:inline-block ${STATUS_COLORS[d.status]}`}>
                      {statusLabel[d.status]}
                    </span>
                  </div>
                  {d.notes && <p className="text-sm text-gray-500 flex gap-1.5 mb-3"><span className="text-[#be3a4a]">✦</span>{d.notes}</p>}
                  <div className="flex items-center gap-4 no-print">
                    {d.mapsLink && <a href={d.mapsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#be3a4a] font-medium hover:underline">{t.viewOnMaps}</a>}
                    {cancelId === d.id ? (
                      <span className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{t.removeConfirm}</span>
                        <button onClick={() => handleCancel(d.id)} className="text-red-500 font-medium hover:underline">{t.yesRemove}</button>
                        <button onClick={() => setCancelId(null)} className="text-gray-400 hover:underline">{t.keep}</button>
                      </span>
                    ) : (
                      <button onClick={() => setCancelId(d.id)} className="text-sm text-gray-400 hover:text-red-400 transition-colors">{t.cancelDate}</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">{t.noSchedule}</p>
          <Link href="/ideas" className="text-[#be3a4a] font-medium hover:underline">{t.findIdeas}</Link>
        </div>
      )}

      {/* Add date modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 no-print"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">{t.newDateTitle}</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t.titleLabel} *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={t.titlePlaceholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t.dateLabel} *</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t.timeLabel}</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t.venueLabel}</label>
                <input value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                  placeholder={t.venuePlaceholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t.notesLabel}</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t.notesPlaceholder} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a] resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors">{t.cancel}</button>
                <button type="submit"
                  className="flex-1 bg-[#be3a4a] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#a3303f] transition-colors">{t.addToSchedule}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

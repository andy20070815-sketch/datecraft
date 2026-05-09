"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  subscribeToSchedule, addToSchedule, removeFromSchedule, updateStatus,
  type ScheduledDate,
} from "../lib/schedule";
import {
  subscribeToCouple, generateInviteCode, joinWithCode, unlinkCouple,
  type CoupleInfo,
} from "../lib/couple";
import { useLanguage } from "../lib/i18n";
import { useAuth } from "../lib/auth";

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
function buildGCalUrl(d: ScheduledDate): string {
  const title = encodeURIComponent(d.title);
  const location = encodeURIComponent(d.address || d.venueName || "");
  const notes = encodeURIComponent(d.notes || "");
  let dates = "";
  if (d.date) {
    const base = d.date.replace(/-/g, "");
    if (d.time) {
      const [h, m] = d.time.split(":").map(Number);
      const pad = (n: number) => String(n).padStart(2, "0");
      dates = `${base}T${pad(h)}${pad(m)}00/${base}T${pad(h + 1)}${pad(m)}00`;
    } else {
      const next = new Date(d.date + "T00:00:00");
      next.setDate(next.getDate() + 1);
      dates = `${base}/${next.toISOString().slice(0, 10).replace(/-/g, "")}`;
    }
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&location=${location}&details=${notes}`;
}

interface FormState {
  title: string; venueName: string; address: string;
  mapsLink: string; date: string; time: string; notes: string;
}
const EMPTY: FormState = { title: "", venueName: "", address: "", mapsLink: "", date: "", time: "", notes: "" };

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

  // Couple panel state
  const [inviteCode, setInviteCode]   = useState("");
  const [codeInput, setCodeInput]     = useState("");
  const [codeError, setCodeError]     = useState("");
  const [codeCopied, setCodeCopied]   = useState(false);
  const [unlinkConfirm, setUnlinkConfirm] = useState(false);
  const [joining, setJoining]         = useState(false);

  // Subscribe to couple status
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToCouple(user, setCouple);
    return unsub;
  }, [user]);

  // Subscribe to schedule (switches between solo and couple collection)
  useEffect(() => {
    if (!user) { setDates([]); return; }
    const unsub = subscribeToSchedule(user, couple?.id ?? null, setDates);
    return unsub;
  }, [user, couple?.id]);

  // Reset invite code when couple status changes
  useEffect(() => { if (couple) setInviteCode(""); }, [couple]);

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

  async function handleGenerateCode() {
    if (!user) return;
    const code = await generateInviteCode(user);
    setInviteCode(code);
  }
  async function handleCopyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }
  async function handleJoin() {
    if (!user || !codeInput.trim()) return;
    setJoining(true);
    setCodeError("");
    const result = await joinWithCode(user, codeInput);
    setJoining(false);
    if (result === "ok") { setCodeInput(""); }
    else if (result === "not_found") setCodeError(t.codeNotFound);
    else if (result === "self") setCodeError(t.codeSelf);
    else setCodeError(t.codeError);
  }
  async function handleUnlink() {
    if (!user || !couple) return;
    await unlinkCouple(user, couple);
    setUnlinkConfirm(false);
    setCouple(null);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-4xl mb-4">♥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.yourSchedule}</h2>
        <p className="text-gray-500 mb-6 max-w-xs">{t.signInPrompt}</p>
        <button onClick={signIn} className="bg-[#be3a4a] text-white px-6 py-3 rounded-full font-medium hover:bg-[#a3303f] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t.signIn}
        </button>
      </div>
    );
  }

  const partnerUid = couple?.members.find((m) => m !== user.uid);
  const partnerInfo = partnerUid ? couple?.memberInfo[partnerUid] : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Couple sync panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 no-print">
        {couple && partnerInfo ? (
          /* Linked state */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {user.photoURL && (
                  <Image src={user.photoURL} alt="" width={32} height={32} className="rounded-full ring-2 ring-white" />
                )}
                {partnerInfo.photoURL && (
                  <Image src={partnerInfo.photoURL} alt="" width={32} height={32} className="rounded-full ring-2 ring-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {t.linkedWith} {partnerInfo.displayName}
                </p>
                <p className="text-xs text-gray-400">♥ {lang === "zh" ? "行程共享中" : "Shared schedule"}</p>
              </div>
            </div>
            {unlinkConfirm ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{t.unlinkConfirm}</span>
                <button onClick={handleUnlink} className="text-red-500 font-medium hover:underline">{t.yesRemove}</button>
                <button onClick={() => setUnlinkConfirm(false)} className="text-gray-400 hover:underline">{t.keep}</button>
              </span>
            ) : (
              <button onClick={() => setUnlinkConfirm(true)} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                {t.unlink}
              </button>
            )}
          </div>
        ) : (
          /* Unlinked state */
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-4">♥ {t.linkPartner}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Generate code side */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-2">{t.generateCode}</p>
                {inviteCode ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold tracking-widest text-[#be3a4a] bg-rose-50 px-4 py-2 rounded-xl">
                      {inviteCode}
                    </span>
                    <button onClick={handleCopyCode} className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-lg transition-colors">
                      {codeCopied ? t.codeCopied : t.copyCode}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleGenerateCode} className="border border-[#be3a4a] text-[#be3a4a] px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors">
                    {t.generateCode}
                  </button>
                )}
              </div>
              {/* Divider */}
              <div className="flex sm:flex-col items-center gap-2">
                <div className="flex-1 h-px sm:h-full sm:w-px bg-gray-100" />
                <span className="text-xs text-gray-400 shrink-0">{lang === "zh" ? "或" : "or"}</span>
                <div className="flex-1 h-px sm:h-full sm:w-px bg-gray-100" />
              </div>
              {/* Enter code side */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-2">{t.enterCode}</p>
                <div className="flex gap-2">
                  <input
                    value={codeInput}
                    onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setCodeError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    placeholder="ABC123"
                    maxLength={6}
                    className="font-mono w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a] uppercase tracking-widest"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={joining || codeInput.length < 6}
                    className="bg-[#be3a4a] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#a3303f] transition-colors disabled:opacity-50"
                  >
                    {joining ? "..." : t.joinCouple}
                  </button>
                </div>
                {codeError && <p className="text-xs text-red-500 mt-1">{codeError}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">{t.yourSchedule}</h1>
          <p className="text-gray-500">
            {upcoming > 0 ? `${upcoming} ${t.upcoming} · ` : ""}
            {dates.length === 0 ? t.noSchedule : `${dates.length} ${lang === "zh" ? "共" : "total"}`}
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
              <button onClick={() => window.print()} className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-full font-medium text-sm hover:border-gray-400 transition-colors">
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
                  <div className="flex items-center gap-4 no-print flex-wrap">
                    {d.mapsLink && <a href={d.mapsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#be3a4a] font-medium hover:underline">{t.viewOnMaps}</a>}
                    {d.date && (
                      <a href={buildGCalUrl(d)} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 font-medium hover:text-[#be3a4a] transition-colors">
                        📅 {t.addToGCal}
                      </a>
                    )}
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

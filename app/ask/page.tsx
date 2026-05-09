"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import { addToSchedule } from "../lib/schedule";
import { subscribeToCouple, type CoupleInfo } from "../lib/couple";

interface Venue {
  place_id: string;
  name: string;
  address: string;
  maps_link: string;
  rating?: number;
  price_level?: number;
  photo_url?: string;
  tip?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  venues?: Venue[];
}

interface SchedulingVenue extends Venue {
  schedDate: string;
  schedTime: string;
  schedNotes: string;
}

const GREETING_EN = "Hey! Tell me what kind of date you're thinking — the vibe, area, what you're into, anything. I'll find real spots in Taipei.";
const GREETING_ZH = "嗨！告訴我你想要什麼樣的約會——氣氛、地點、喜好都可以說，我幫你在台北找地方。";

export default function AskPage() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [couple, setCouple] = useState<CoupleInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [scheduling, setScheduling] = useState<{ venue: Venue; date: string; time: string; notes: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToCouple(user, setCouple);
    return unsub;
  }, [user]);

  useEffect(() => {
    setMessages([{ role: "assistant", content: lang === "zh" ? GREETING_ZH : GREETING_EN }]);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        role: "assistant",
        content: data.content,
        venues: data.type === "results" ? data.venues : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduling || !user) return;
    await addToSchedule(user, couple?.id ?? null, {
      title: scheduling.venue.name,
      venueName: scheduling.venue.name,
      address: scheduling.venue.address,
      mapsLink: scheduling.venue.maps_link,
      date: scheduling.date,
      time: scheduling.time,
      notes: scheduling.notes,
    });
    setAddedIds((prev) => new Set(prev).add(scheduling.venue.place_id));
    setScheduling(null);
  }

  function handleReset() {
    setMessages([{ role: "assistant", content: lang === "zh" ? GREETING_ZH : GREETING_EN }]);
    setAddedIds(new Set());
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="max-w-2xl mx-auto px-4 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
                {/* Bubble */}
                {msg.content && (
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#be3a4a] text-white rounded-br-sm"
                      : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                )}

                {/* Venue cards attached to this message */}
                {msg.venues && msg.venues.length > 0 && (
                  <div className="mt-3 flex flex-col gap-3">
                    {msg.venues.map((v) => (
                      <div key={v.place_id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex">
                        {v.photo_url && (
                          <Image
                            src={v.photo_url}
                            alt={v.name}
                            width={80}
                            height={80}
                            className="w-20 h-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="p-4 flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{v.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                              {v.rating && <span>★ {v.rating}</span>}
                              {v.price_level && <span>{"$".repeat(v.price_level)}</span>}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2 truncate">📍 {v.address}</p>
                          {v.tip && (
                            <p className="text-xs text-gray-500 mb-2 flex gap-1">
                              <span className="text-[#be3a4a] shrink-0">✦</span>
                              <span className="line-clamp-2">{v.tip}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-3">
                            <a
                              href={v.maps_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#be3a4a] font-medium hover:underline"
                            >
                              {t.viewOnMaps}
                            </a>
                            {addedIds.has(v.place_id) ? (
                              <span className="text-xs text-green-600 font-medium">{t.added}</span>
                            ) : user ? (
                              <button
                                onClick={() => setScheduling({ venue: v, date: "", time: "", notes: "" })}
                                className="text-xs text-gray-500 font-medium hover:text-[#be3a4a] transition-colors border border-gray-200 rounded-full px-2.5 py-0.5 hover:border-[#be3a4a]"
                              >
                                {t.scheduleBtn}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Refine prompt */}
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {lang === "zh"
                        ? "不滿意？繼續說你的想法，我幫你調整。"
                        : "Not quite right? Keep chatting and I'll refine it."}
                    </p>
                  </div>
                )}

                {msg.venues && msg.venues.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2 ml-1">
                    {lang === "zh" ? "這個條件找不到地點，換個方向試試？" : "No venues found for that. Want to try a different angle?"}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          <button
            onClick={handleReset}
            title={lang === "zh" ? "重新開始" : "Start over"}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={lang === "zh" ? "說說你想要什麼樣的約會..." : "Describe the date you have in mind..."}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#be3a4a] bg-gray-50"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-[#be3a4a] text-white p-2.5 rounded-full hover:bg-[#a3303f] transition-colors disabled:opacity-40 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Schedule modal */}
      {scheduling && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setScheduling(null); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t.addToSchedule}</h2>
            <p className="text-sm text-gray-500 mb-5">{scheduling.venue.name}</p>
            <form onSubmit={handleSchedule} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t.dateLabel} *</label>
                  <input
                    required type="date"
                    value={scheduling.date}
                    onChange={(e) => setScheduling({ ...scheduling, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t.timeLabel}</label>
                  <input
                    type="time"
                    value={scheduling.time}
                    onChange={(e) => setScheduling({ ...scheduling, time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t.notesLabel}</label>
                <textarea
                  value={scheduling.notes}
                  onChange={(e) => setScheduling({ ...scheduling, notes: e.target.value })}
                  placeholder={t.notesPlaceholder}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setScheduling(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors">
                  {t.cancel}
                </button>
                <button type="submit"
                  className="flex-1 bg-[#be3a4a] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#a3303f] transition-colors">
                  {t.addToSchedule}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

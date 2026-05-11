"use client";

import { useState, useEffect } from "react";
import { addToSchedule } from "../lib/schedule";
import { subscribeToCouple, type CoupleInfo } from "../lib/couple";
import { useLanguage } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import { ITEM_CONSTRAINTS } from "./constants";
import type { Venue, ConvState, ApiMessage } from "./types";
import HeroSearch from "@/components/ideas/HeroSearch";
import FilterCard from "@/components/ideas/FilterCard";
import VenueCard from "@/components/ideas/VenueCard";
import ScheduleModal from "@/components/ideas/ScheduleModal";

export default function IdeasPage() {
  const { t } = useLanguage();
  const { user, signIn } = useAuth();
  const [couple, setCouple] = useState<CoupleInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToCouple(user, setCouple);
  }, [user]);

  // Filter state
  const [neighbourhood, setNeighbourhood] = useState("All Taipei");
  const [budget, setBudget]               = useState("$$ Medium (NT$300-800)");
  const [vibe, setVibe]                   = useState("Casual");
  const [timeOfDay, setTimeOfDay]         = useState("Any time");
  const [interests, setInterests]         = useState<string[]>([]);
  const [showInterests, setShowInterests] = useState(false);

  // Results state
  const [loading, setLoading]             = useState(false);
  const [venues, setVenues]               = useState<Venue[]>([]);
  const [relevantCount, setRelevantCount] = useState(0);
  const [searched, setSearched]           = useState(false);

  // Schedule modal state
  const [schedulingVenue, setSchedulingVenue] = useState<Venue | null>(null);
  const [schedDate, setSchedDate]             = useState("");
  const [schedTime, setSchedTime]             = useState("");
  const [schedNotes, setSchedNotes]           = useState("");
  const [addedIds, setAddedIds]               = useState<Set<string>>(new Set());

  // AI search state
  const [aiQuery, setAiQuery]   = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [conv, setConv]         = useState<ConvState | null>(null);

  const budgetLevel = budget.match(/^\$+/)?.[0] ?? "$$";

  function isItemMismatch(item: string): boolean {
    const c = ITEM_CONSTRAINTS[item];
    if (!c) return false;
    if (c.budgets && !c.budgets.includes(budgetLevel)) return true;
    if (c.times && timeOfDay !== "Any time" && !c.times.includes(timeOfDay)) return true;
    return false;
  }

  function toggleInterest(i: string) {
    if (isItemMismatch(i)) return;
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  }

  async function findSpots(params?: { neighbourhood: string; budget: string; vibe: string; timeOfDay: string; interests: string[] }) {
    setLoading(true);
    setSearched(true);
    const body = params ?? { neighbourhood, budget, vibe, timeOfDay, interests };
    try {
      const res = await fetch("/api/find-date-spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setVenues(data.venues ?? []);
      setRelevantCount(data.relevantCount ?? 0);
    } catch {
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }

  async function callParseQuery(messages: ApiMessage[]) {
    const res = await fetch("/api/parse-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    return res.json() as Promise<
      | { type: "question"; text: string; options: string[] }
      | { type: "search"; text: string; params: { neighbourhood: string; budget: string; vibe: string; timeOfDay: string; interests: string[] } }
    >;
  }

  async function handleAiSearch(query?: string) {
    const q = (query ?? aiQuery).trim();
    if (!q) return;
    setConv(null);
    setAiLoading(true);
    const messages: ApiMessage[] = [{ role: "user", content: q }];
    try {
      const data = await callParseQuery(messages);
      if (data.type === "question") {
        setConv({ question: data.text, options: data.options, messages });
      } else {
        applyParamsAndSearch(data.params);
      }
    } finally {
      setAiLoading(false);
    }
  }

  async function handleOptionClick(option: string) {
    if (!conv) return;
    const messages: ApiMessage[] = [
      ...conv.messages,
      { role: "assistant", content: JSON.stringify({ type: "question", text: conv.question, options: conv.options }) },
      { role: "user", content: option },
    ];
    setConv(null);
    setAiLoading(true);
    try {
      const data = await callParseQuery(messages);
      if (data.type === "question") {
        setConv({ question: data.text, options: data.options, messages });
      } else {
        applyParamsAndSearch(data.params);
      }
    } finally {
      setAiLoading(false);
    }
  }

  function applyParamsAndSearch(params: { neighbourhood: string; budget: string; vibe: string; timeOfDay: string; interests: string[] }) {
    setNeighbourhood(params.neighbourhood);
    setBudget(params.budget);
    setVibe(params.vibe);
    setTimeOfDay(params.timeOfDay);
    setInterests(params.interests ?? []);
    findSpots(params);
  }

  async function handleAddToSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!schedulingVenue || !user) return;
    await addToSchedule(user, couple?.id ?? null, {
      title: schedulingVenue.name,
      venueName: schedulingVenue.name,
      address: schedulingVenue.address,
      mapsLink: schedulingVenue.maps_link,
      date: schedDate,
      time: schedTime,
      notes: schedNotes,
    });
    setAddedIds((prev) => new Set(prev).add(schedulingVenue.place_id));
    setSchedulingVenue(null);
    setSchedDate("");
    setSchedTime("");
    setSchedNotes("");
  }

  return (
    <div>
      <HeroSearch
        aiQuery={aiQuery}
        aiLoading={aiLoading}
        conv={conv}
        setAiQuery={setAiQuery}
        setConv={setConv}
        onSearch={handleAiSearch}
        onOptionClick={handleOptionClick}
      />

      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <FilterCard
          neighbourhood={neighbourhood}
          budget={budget}
          vibe={vibe}
          timeOfDay={timeOfDay}
          interests={interests}
          showInterests={showInterests}
          loading={loading}
          setNeighbourhood={setNeighbourhood}
          setBudget={setBudget}
          setVibe={setVibe}
          setTimeOfDay={setTimeOfDay}
          setShowInterests={setShowInterests}
          toggleInterest={toggleInterest}
          isItemMismatch={isItemMismatch}
          onSearch={() => findSpots()}
        />

        {searched && !loading && (
          <div>
            {venues.length === 0 ? (
              <p className="text-center text-gray-400 py-10">{t.noVenues}</p>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  {relevantCount > 0 && interests.length > 0
                    ? `${relevantCount} ${t.matched} · ${venues.length - relevantCount} ${t.moreNearby}`
                    : `${venues.length} ${t.spotsFound}`}
                </p>
                <div className="flex flex-col gap-4">
                  {venues.map((v, idx) => (
                    <div key={v.place_id}>
                      {interests.length > 0 && idx === relevantCount && relevantCount > 0 && venues.length > relevantCount && (
                        <div className="flex items-center gap-3 my-6">
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{t.moreNearby}</span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>
                      )}
                      <VenueCard
                        v={v}
                        isAdded={addedIds.has(v.place_id)}
                        isLoggedIn={!!user}
                        onScheduleClick={() => user ? setSchedulingVenue(v) : signIn()}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {schedulingVenue && (
          <ScheduleModal
            venue={schedulingVenue}
            schedDate={schedDate}
            schedTime={schedTime}
            schedNotes={schedNotes}
            setSchedDate={setSchedDate}
            setSchedTime={setSchedTime}
            setSchedNotes={setSchedNotes}
            onClose={() => setSchedulingVenue(null)}
            onSubmit={handleAddToSchedule}
          />
        )}
      </div>
    </div>
  );
}

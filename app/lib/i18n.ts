"use client";

import { useState, useEffect } from "react";

export type Lang = "en" | "zh";
const KEY = "datecraft_lang";

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState((localStorage.getItem(KEY) as Lang) ?? "en");
    const handler = () => setLangState((localStorage.getItem(KEY) as Lang) ?? "en");
    window.addEventListener("datecraft_lang", handler);
    return () => window.removeEventListener("datecraft_lang", handler);
  }, []);

  function toggle() {
    const next: Lang = lang === "en" ? "zh" : "en";
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event("datecraft_lang"));
    setLangState(next);
  }

  return { lang, toggle, t: T[lang] };
}

export const T = {
  en: {
    // Nav
    schedule: "Schedule", newDate: "+ New Date", ideas: "✦ Ideas",
    // Ideas
    pageTitle: "Date Idea Generator",
    pageSubtitle: "Real Taipei venues, tuned to your vibe — photos & maps links.",
    filters: "Filters", neighbourhood: "Neighbourhood", budget: "Budget",
    vibe: "Vibe", timeOfDay: "Time of Day", interests: "Interests",
    findSpots: "✦ Find Date Spots", finding: "Finding spots...",
    viewOnMaps: "View on Maps →", scheduleBtn: "+ Schedule", added: "✓ Added",
    noVenues: "No venues found. Try a different neighbourhood or vibe.",
    moreNearby: "More nearby", matched: "matched", spotsFound: "spots found",
    // Categories
    catFood: "Food & Drink", catArts: "Arts & Culture",
    catCreative: "Creative & Hands-on", catEntertainment: "Entertainment",
    catActive: "Active & Outdoor", catChill: "Chill & Wellness",
    // Schedule
    yourSchedule: "Your Date Schedule", browseIdeas: "Browse Ideas",
    noSchedule: "No dates scheduled yet.", findIdeas: "Find date ideas →",
    planned: "planned", confirmed: "confirmed", completed: "completed",
    cancelDate: "Cancel date", removeConfirm: "Remove this date?",
    yesRemove: "Yes, remove", keep: "Keep",
    upcoming: "upcoming",
    exportPdf: "Export PDF", share: "Share",
    shareSuccess: "Copied to clipboard!",
    // Modals
    newDateTitle: "New Date", addToSchedule: "Add to Schedule",
    titleLabel: "Title", dateLabel: "Date", timeLabel: "Time",
    venueLabel: "Venue name", notesLabel: "Notes",
    notesPlaceholder: "Any reminders or ideas...",
    venuePlaceholder: "e.g. Shilin Night Market",
    titlePlaceholder: "e.g. Night Market Crawl",
    cancel: "Cancel",
  },
  zh: {
    // Nav
    schedule: "行程", newDate: "+ 新增約會", ideas: "✦ 點子",
    // Ideas
    pageTitle: "約會點子產生器",
    pageSubtitle: "台北真實場所，根據你的氛圍篩選 — 附照片與地圖連結。",
    filters: "篩選條件", neighbourhood: "地區", budget: "預算",
    vibe: "氛圍", timeOfDay: "時段", interests: "興趣",
    findSpots: "✦ 尋找約會地點", finding: "搜尋中...",
    viewOnMaps: "在地圖上查看 →", scheduleBtn: "+ 加入行程", added: "✓ 已加入",
    noVenues: "找不到場所，請嘗試不同地區或氛圍。",
    moreNearby: "附近更多", matched: "個符合", spotsFound: "個地點",
    // Categories
    catFood: "餐飲", catArts: "藝術文化",
    catCreative: "創意手作", catEntertainment: "娛樂",
    catActive: "戶外活動", catChill: "放鬆養生",
    // Schedule
    yourSchedule: "你的約會行程", browseIdeas: "瀏覽點子",
    noSchedule: "還沒有排定約會。", findIdeas: "尋找約會點子 →",
    planned: "計劃中", confirmed: "已確認", completed: "已完成",
    cancelDate: "取消約會", removeConfirm: "確定移除嗎？",
    yesRemove: "確定移除", keep: "保留",
    upcoming: "個即將到來",
    exportPdf: "匯出 PDF", share: "分享",
    shareSuccess: "已複製到剪貼簿！",
    // Modals
    newDateTitle: "新增約會", addToSchedule: "加入行程",
    titleLabel: "標題", dateLabel: "日期", timeLabel: "時間",
    venueLabel: "場所名稱", notesLabel: "備註",
    notesPlaceholder: "備忘或想法...",
    venuePlaceholder: "例：士林夜市",
    titlePlaceholder: "例：夜市探索",
    cancel: "取消",
  },
};

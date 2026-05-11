import type { ScheduledDate } from "../lib/schedule";

export const FEATURED_SPOTS = [
  {
    emoji: "🌅",
    name: { en: "Elephant Mountain", zh: "象山" },
    area: { en: "Xinyi", zh: "信義區" },
    desc: {
      en: "Golden-hour hike with Taipei 101 directly in view — the city's most iconic date backdrop.",
      zh: "黃金時刻登山，台北101近在眼前，城市最浪漫的約會背景。",
    },
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Elephant+Mountain+Taipei",
    tags: { en: ["Outdoors", "Sunset", "Free"], zh: ["戶外", "夕陽", "免費"] },
  },
  {
    emoji: "♨️",
    name: { en: "Beitou Hot Springs", zh: "北投溫泉" },
    area: { en: "Beitou", zh: "北投區" },
    desc: {
      en: "A whole neighbourhood built for relaxation — onsen soaks, Japanese-style ryokan, and a cliffside library.",
      zh: "整個街區都是泡湯文化，日式旅館和懸崖邊的特色圖書館。",
    },
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Beitou+Hot+Springs+Taipei",
    tags: { en: ["Spa", "Relaxing", "Japanese vibe"], zh: ["溫泉", "放鬆", "日式"] },
  },
  {
    emoji: "🏮",
    name: { en: "Jiufen Old Street", zh: "九份老街" },
    area: { en: "30 min from Taipei", zh: "距台北30分鐘" },
    desc: {
      en: "Lantern-lit hillside alleyways, teahouses on cliff edges, and sweeping ocean views at dusk.",
      zh: "燈籠點亮山城小巷，懸崖邊的茶館，傍晚海景令人屏息。",
    },
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Jiufen+Old+Street+Taiwan",
    tags: { en: ["Scenic", "Teahouse", "Day trip"], zh: ["風景", "茶館", "一日遊"] },
  },
  {
    emoji: "🎨",
    name: { en: "Huashan 1914", zh: "華山1914文創園區" },
    area: { en: "Zhongzheng", zh: "中正區" },
    desc: {
      en: "Converted wine factory turned creative park — indie shops, art shows, open-air concerts, and weekend markets.",
      zh: "舊酒廠改建的文創園區，有獨立小店、藝術展覽和週末市集。",
    },
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Huashan+1914+Creative+Park+Taipei",
    tags: { en: ["Arts", "Cafés", "Events"], zh: ["藝術", "咖啡廳", "活動"] },
  },
  {
    emoji: "🌸",
    name: { en: "Yangmingshan", zh: "陽明山國家公園" },
    area: { en: "Shilin / Beitou", zh: "士林 / 北投" },
    desc: {
      en: "Volcanic peaks, seasonal flower fields, and natural hot springs above the city. A full-day escape.",
      zh: "火山山頂、季節花海和天然溫泉，城市上方的完美一日遊。",
    },
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Yangmingshan+National+Park+Taipei",
    tags: { en: ["Nature", "Hot Springs", "Flowers"], zh: ["自然", "溫泉", "花季"] },
  },
  {
    emoji: "🍸",
    name: { en: "Zhongshan District", zh: "中山區" },
    area: { en: "Zhongshan", zh: "中山區" },
    desc: {
      en: "Taipei's most stylish neighbourhood — tree-lined streets, concept cafés, rooftop bars, and vintage boutiques.",
      zh: "台北最時尚街區：林蔭大道、個性咖啡廳、屋頂酒吧和古著店。",
    },
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Zhongshan+District+Taipei",
    tags: { en: ["Cafés", "Bars", "Nightlife"], zh: ["咖啡廳", "酒吧", "夜生活"] },
  },
];

export const STATUS_COLORS: Record<ScheduledDate["status"], string> = {
  planned:   "bg-amber-100 text-amber-700",
  confirmed: "bg-rose-100 text-[#be3a4a]",
  completed: "bg-gray-100 text-gray-500",
};

export const STATUS_NEXT: Record<ScheduledDate["status"], ScheduledDate["status"]> = {
  planned: "confirmed", confirmed: "completed", completed: "planned",
};

export function formatDate(iso: string) {
  if (!iso) return { month: "—", day: "—" as string | number };
  const d = new Date(iso + "T00:00:00");
  return { month: d.toLocaleString("en", { month: "short" }).toUpperCase(), day: d.getDate() };
}

export function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function buildGCalUrl(d: ScheduledDate): string {
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

export interface FormState {
  title: string;
  venueName: string;
  address: string;
  mapsLink: string;
  date: string;
  time: string;
  notes: string;
}

export const EMPTY: FormState = {
  title: "", venueName: "", address: "", mapsLink: "", date: "", time: "", notes: "",
};

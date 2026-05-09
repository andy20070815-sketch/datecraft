export interface ScheduledDate {
  id: string;
  title: string;
  venueName: string;
  address: string;
  mapsLink: string;
  date: string;   // "2026-05-20"
  time: string;   // "19:00"
  notes: string;
  status: "planned" | "confirmed" | "completed";
}

const KEY = "datecraft_schedule";

export function getSchedule(): ScheduledDate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveSchedule(dates: ScheduledDate[]): void {
  localStorage.setItem(KEY, JSON.stringify(dates));
}

export function addToSchedule(entry: Omit<ScheduledDate, "id" | "status">): ScheduledDate {
  const dates = getSchedule();
  const newDate: ScheduledDate = { ...entry, id: crypto.randomUUID(), status: "planned" };
  dates.push(newDate);
  saveSchedule(dates);
  return newDate;
}

export function removeFromSchedule(id: string): void {
  saveSchedule(getSchedule().filter((d) => d.id !== id));
}

export function updateStatus(id: string, status: ScheduledDate["status"]): void {
  saveSchedule(getSchedule().map((d) => (d.id === id ? { ...d, status } : d)));
}

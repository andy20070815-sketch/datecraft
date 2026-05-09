import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";

export interface ScheduledDate {
  id: string;
  title: string;
  venueName: string;
  address: string;
  mapsLink: string;
  date: string;
  time: string;
  notes: string;
  status: "planned" | "confirmed" | "completed";
}

function datesRef(userId: string, coupleId: string | null) {
  if (coupleId) return collection(db, "couples", coupleId, "dates");
  return collection(db, "schedules", userId, "dates");
}

function dateDoc(userId: string, coupleId: string | null, id: string) {
  if (coupleId) return doc(db, "couples", coupleId, "dates", id);
  return doc(db, "schedules", userId, "dates", id);
}

export function subscribeToSchedule(
  user: User,
  coupleId: string | null,
  callback: (dates: ScheduledDate[]) => void,
): () => void {
  return onSnapshot(datesRef(user.uid, coupleId), (snap) => {
    const dates = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as ScheduledDate))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    callback(dates);
  });
}

export async function addToSchedule(
  user: User,
  coupleId: string | null,
  entry: Omit<ScheduledDate, "id" | "status">,
): Promise<void> {
  await addDoc(datesRef(user.uid, coupleId), { ...entry, status: "planned" });
}

export async function removeFromSchedule(
  user: User,
  coupleId: string | null,
  id: string,
): Promise<void> {
  await deleteDoc(dateDoc(user.uid, coupleId, id));
}

export async function updateStatus(
  user: User,
  coupleId: string | null,
  id: string,
  status: ScheduledDate["status"],
): Promise<void> {
  await updateDoc(dateDoc(user.uid, coupleId, id), { status });
}

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

function datesRef(userId: string) {
  return collection(db, "schedules", userId, "dates");
}

export function subscribeToSchedule(
  user: User,
  callback: (dates: ScheduledDate[]) => void,
): () => void {
  return onSnapshot(datesRef(user.uid), (snap) => {
    const dates = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as ScheduledDate))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    callback(dates);
  });
}

export async function addToSchedule(
  user: User,
  entry: Omit<ScheduledDate, "id" | "status">,
): Promise<void> {
  await addDoc(datesRef(user.uid), { ...entry, status: "planned" });
}

export async function removeFromSchedule(user: User, id: string): Promise<void> {
  await deleteDoc(doc(db, "schedules", user.uid, "dates", id));
}

export async function updateStatus(
  user: User,
  id: string,
  status: ScheduledDate["status"],
): Promise<void> {
  await updateDoc(doc(db, "schedules", user.uid, "dates", id), { status });
}

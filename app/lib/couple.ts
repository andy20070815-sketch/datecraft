"use client";

import {
  collection, doc, setDoc, getDoc, deleteDoc,
  query, where, limit, onSnapshot,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";

export interface CoupleInfo {
  id: string;
  members: string[];
  memberInfo: Record<string, { displayName: string; photoURL: string }>;
}

export function subscribeToCouple(
  user: User,
  callback: (couple: CoupleInfo | null) => void,
): () => void {
  const q = query(
    collection(db, "couples"),
    where("members", "array-contains", user.uid),
    limit(1),
  );
  return onSnapshot(q, (snap) => {
    if (snap.empty) { callback(null); return; }
    const d = snap.docs[0];
    callback({ id: d.id, ...d.data() } as CoupleInfo);
  });
}

export async function generateInviteCode(user: User): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await setDoc(doc(db, "invites", code), {
    uid: user.uid,
    displayName: user.displayName ?? "",
    photoURL: user.photoURL ?? "",
    createdAt: Date.now(),
  });
  return code;
}

export type JoinResult = "ok" | "not_found" | "self" | "already_linked";

export async function joinWithCode(user: User, code: string): Promise<JoinResult> {
  const inviteSnap = await getDoc(doc(db, "invites", code.toUpperCase().trim()));
  if (!inviteSnap.exists()) return "not_found";

  const invite = inviteSnap.data();
  if (invite.uid === user.uid) return "self";

  const coupleId = crypto.randomUUID();
  await setDoc(doc(db, "couples", coupleId), {
    members: [invite.uid, user.uid],
    memberInfo: {
      [invite.uid]: { displayName: invite.displayName, photoURL: invite.photoURL },
      [user.uid]: { displayName: user.displayName ?? "", photoURL: user.photoURL ?? "" },
    },
    createdAt: Date.now(),
  });

  await deleteDoc(doc(db, "invites", code.toUpperCase().trim()));
  return "ok";
}

export async function unlinkCouple(user: User, couple: CoupleInfo): Promise<void> {
  const ref = doc(db, "couples", couple.id);
  const remaining = couple.members.filter((m) => m !== user.uid);

  if (remaining.length === 0) {
    await deleteDoc(ref);
  } else {
    const newInfo = { ...couple.memberInfo };
    delete newInfo[user.uid];
    await setDoc(ref, { ...couple, members: remaining, memberInfo: newInfo });
  }
}

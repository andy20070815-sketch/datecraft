"use client";

import { useState } from "react";
import Image from "next/image";
import type { User } from "firebase/auth";
import {
  generateInviteCode, joinWithCode, unlinkCouple, type CoupleInfo,
} from "@/app/lib/couple";
import { useLanguage } from "@/app/lib/i18n";

interface Props {
  user: User;
  couple: CoupleInfo | null;
}

export default function CoupleSyncPanel({ user, couple }: Props) {
  const { t, lang } = useLanguage();
  const [inviteCode, setInviteCode]       = useState("");
  const [codeInput, setCodeInput]         = useState("");
  const [codeError, setCodeError]         = useState("");
  const [codeCopied, setCodeCopied]       = useState(false);
  const [unlinkConfirm, setUnlinkConfirm] = useState(false);
  const [joining, setJoining]             = useState(false);

  const partnerUid  = couple?.members.find((m) => m !== user.uid);
  const partnerInfo = partnerUid ? couple?.memberInfo[partnerUid] : null;

  async function handleGenerateCode() {
    const code = await generateInviteCode(user);
    setInviteCode(code);
  }
  async function handleCopyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }
  async function handleJoin() {
    if (!codeInput.trim()) return;
    setJoining(true);
    setCodeError("");
    const result = await joinWithCode(user, codeInput);
    setJoining(false);
    if (result === "ok")             { setCodeInput(""); }
    else if (result === "not_found") setCodeError(t.codeNotFound);
    else if (result === "self")      setCodeError(t.codeSelf);
    else                             setCodeError(t.codeError);
  }
  async function handleUnlink() {
    if (!couple) return;
    await unlinkCouple(user, couple);
    setUnlinkConfirm(false);
  }

  if (couple && partnerInfo) {
    return (
      <div className="rounded-2xl overflow-hidden border border-rose-100 shadow-sm mb-8 no-print">
        {/* Linked — gradient banner */}
        <div className="bg-gradient-to-r from-[#be3a4a] to-[#e05d45] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {user.photoURL && (
                <Image src={user.photoURL} alt="" width={40} height={40} className="rounded-full ring-2 ring-white/60" />
              )}
              {partnerInfo.photoURL && (
                <Image src={partnerInfo.photoURL} alt="" width={40} height={40} className="rounded-full ring-2 ring-white/60" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {t.linkedWith} {partnerInfo.displayName}
              </p>
              <p className="text-xs text-white/70">
                ♥ {lang === "zh" ? "行程共享中" : "Shared schedule active"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setUnlinkConfirm((v) => !v)}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            {t.unlink}
          </button>
        </div>
        {unlinkConfirm && (
          <div className="bg-white px-5 py-3 flex items-center gap-3 text-sm border-t border-rose-100">
            <span className="text-gray-500 flex-1">{t.unlinkConfirm}</span>
            <button onClick={handleUnlink} className="text-red-500 font-semibold hover:underline">{t.yesRemove}</button>
            <button onClick={() => setUnlinkConfirm(false)} className="text-gray-400 hover:underline">{t.keep}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-8 no-print">
      {/* Dark header */}
      <div className="bg-gradient-to-r from-gray-950 to-gray-800 px-5 py-4 flex items-center gap-2">
        <span className="text-white/50">♥</span>
        <span className="text-sm font-semibold text-white tracking-wide">{t.linkPartner}</span>
      </div>

      <div className="bg-white p-5">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Generate code */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {t.generateCode}
            </p>
            {inviteCode ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold tracking-widest text-[#be3a4a] bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl">
                  {inviteCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-xl hover:border-[#be3a4a] hover:text-[#be3a4a] transition-colors"
                >
                  {codeCopied ? "✓ " + t.codeCopied : t.copyCode}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                className="bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                {t.generateCode}
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex sm:flex-col items-center gap-2 sm:px-2">
            <div className="flex-1 h-px sm:h-full sm:w-px bg-gray-100" />
            <span className="text-xs text-gray-400 shrink-0">{lang === "zh" ? "或" : "or"}</span>
            <div className="flex-1 h-px sm:h-full sm:w-px bg-gray-100" />
          </div>

          {/* Enter code */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {t.enterCode}
            </p>
            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setCodeError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="ABC123"
                maxLength={6}
                className="font-mono w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#be3a4a]/30 focus:border-[#be3a4a] uppercase tracking-widest transition-colors"
              />
              <button
                onClick={handleJoin}
                disabled={joining || codeInput.length < 6}
                className="bg-gradient-to-r from-[#be3a4a] to-[#e05d45] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm"
              >
                {joining ? "..." : t.joinCouple}
              </button>
            </div>
            {codeError && <p className="text-xs text-red-500 mt-2">{codeError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

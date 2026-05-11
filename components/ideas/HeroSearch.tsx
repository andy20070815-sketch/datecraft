"use client";

import { useLanguage } from "@/app/lib/i18n";
import type { ConvState } from "@/app/ideas/types";

interface Props {
  aiQuery: string;
  aiLoading: boolean;
  conv: ConvState | null;
  setAiQuery: (q: string) => void;
  setConv: (c: ConvState | null) => void;
  onSearch: (q?: string) => void;
  onOptionClick: (opt: string) => void;
}

export default function HeroSearch({
  aiQuery, aiLoading, conv,
  setAiQuery, setConv, onSearch, onOptionClick,
}: Props) {
  const { t, lang } = useLanguage();
  const prompts = lang === "zh"
    ? ["浪漫晚餐約會", "第一次見面", "美食探索之旅", "戶外冒險約會", "文藝下午茶", "放鬆咖啡廳約會"]
    : ["Romantic dinner date", "Fun first date", "Foodie adventure", "Outdoor active date", "Artsy cultural day", "Chill café hopping"];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0d0408] via-[#2a0e1c] to-[#7a1f30] px-4 py-14 sm:py-20">
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-56 h-56 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/70 mb-5">
          📍 Taipei City, Taiwan
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl text-white mb-4">{t.pageTitle}</h1>
        <p className="text-white/70 mb-8 text-base sm:text-lg font-medium max-w-lg leading-relaxed">{t.pageSubtitle}</p>

        <div>
          <div className="flex gap-2">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setConv(null); onSearch(); } }}
              placeholder={lang === "zh" ? "✦ 描述你理想的約會..." : "✦ Describe your ideal date..."}
              className="flex-1 bg-white/95 rounded-full px-5 py-3.5 text-sm focus:outline-none shadow-lg placeholder-gray-400"
              disabled={aiLoading}
            />
            <button
              onClick={() => { setConv(null); onSearch(); }}
              disabled={!aiQuery.trim() || aiLoading}
              className="bg-[#be3a4a] text-white px-5 py-3.5 rounded-full text-sm font-medium hover:bg-[#a3303f] transition-colors disabled:opacity-40 flex items-center shadow-lg"
            >
              {aiLoading
                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                : "✦"}
            </button>
          </div>

          {conv && (
            <div className="mt-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <p className="text-sm font-medium text-white mb-3">{conv.question}</p>
              <div className="flex flex-wrap gap-2">
                {conv.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onOptionClick(opt)}
                    disabled={aiLoading}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-colors disabled:opacity-40"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!conv && !aiLoading && (
            <div className="flex flex-wrap gap-2 mt-4">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => { setAiQuery(p); onSearch(p); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

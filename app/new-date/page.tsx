"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const VIBES = ["Casual", "Romantic", "Adventurous", "Foodie", "Cultural", "Nightlife"];
const BUDGETS = ["$ Budget (NT$0-300)", "$$ Medium (NT$300-800)", "$$$ Upscale (NT$800-2000)", "$$$$ Luxury (NT$2000+)"];
const INTERESTS = [
  "Night Market", "Hotpot", "Bubble Tea", "Craft Beer", "Fine Dining",
  "Brunch", "Street Food", "Omakase", "Wine & Dining", "Dessert Café",
  "Specialty Coffee", "Cat Café", "Book Café", "Rooftop Café",
  "Mountain Hiking", "Hot Springs", "Temple Visit", "MRT Hopping",
  "Xinyi Nightlife", "Jiufen Day Trip", "River Cycling", "Lantern Festival",
  "Art Gallery", "Live Music", "Theater", "Photography", "Film", "Museum",
  "Indie Market", "Karaoke", "Board Games", "Escape Room", "Bowling",
  "Cooking Class", "Dance Class", "Arcade", "Yoga", "Shopping",
  "Bookstore", "Spa & Wellness", "Stargazing", "Sunset Watching",
];

export default function NewDatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [venue, setVenue] = useState("");
  const [partner, setPartner] = useState("");
  const [partnerAge, setPartnerAge] = useState("");
  const [budget, setBudget] = useState("$$ Medium (NT$300-800)");
  const [vibe, setVibe] = useState("Casual");
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real app this would save to Supabase
    router.push("/schedule");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Plan a New Date</h1>
      <p className="text-gray-500 mb-8">Fill in the details and let AI help you craft the perfect plan.</p>

      {/* AI generator callout */}
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-6">
        <div className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <span className="text-[#be3a4a]">✦</span> AI Date Idea Generator
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Fill in some preferences below then click generate, or generate right away for a surprise!
        </p>
        <button
          type="button"
          onClick={() => router.push("/ideas")}
          className="bg-[#be3a4a] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#a3303f] transition-colors"
        >
          ✦ Generate Date Idea
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Date Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunset Rooftop Dinner"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Da-an, Taipei"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue (optional)</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Shilin Night Market"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
              />
            </div>
          </div>
        </div>

        {/* Who & What */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Who & What</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner&apos;s Name</label>
              <input
                type="text"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder="Their name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner&apos;s Age</label>
              <select
                value={partnerAge}
                onChange={(e) => setPartnerAge(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
              >
                <option value="">Age</option>
                {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                  <option key={age}>{age}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
              >
                {BUDGETS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vibe</label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
              >
                {VIBES.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Shared Interests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Shared Interests</h2>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleInterest(i)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  interests.includes(i)
                    ? "bg-[#be3a4a] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any special requests, allergies, or ideas..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#be3a4a] resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#be3a4a] text-white py-3 rounded-full font-semibold hover:bg-[#a3303f] transition-colors"
        >
          Save Date
        </button>
      </form>
    </div>
  );
}

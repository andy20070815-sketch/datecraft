"use client";

import { useState } from "react";
import { addToSchedule } from "../lib/schedule";

const NEIGHBOURHOODS = ["All Taipei", "Da-an", "Xinyi", "Zhongshan", "Shilin", "Beitou", "Songshan", "Wanhua", "Neihu", "Tamsui"];
const BUDGETS = ["$ Budget (NT$0-300)", "$$ Medium (NT$300-800)", "$$$ Upscale (NT$800-2000)", "$$$$ Luxury (NT$2000+)"];
const VIBES = ["Casual", "Romantic", "Adventurous", "Foodie", "Cultural", "Nightlife"];
const TIMES = ["Any time", "Morning", "Afternoon", "Evening", "Late night"];
const INTEREST_CATEGORIES = [
  {
    label: "Food & Drink",
    items: [
      "Night Market", "Night Market Crawl", "Street Food", "Food Tour", "Food Market",
      "Hotpot", "Shabu Shabu", "Seafood Hot Pot", "Sukiyaki", "Fondue Night",
      "Bubble Tea", "Mango Shaved Ice", "Ice Cream Walk", "Soft Serve Walk", "Taiyaki Walk",
      "Brunch", "Dim Sum Brunch", "Taiwanese Breakfast", "Waffle Café", "Crepe Café",
      "Ramen", "Dim Sum", "Vietnamese Pho", "Beef Noodle Soup", "Soup Dumplings",
      "Sushi Bar", "Omakase", "Yakitori Bar", "Robatayaki", "Teppanyaki",
      "Korean BBQ", "Izakaya", "Tonkatsu", "Gyoza Bar",
      "Pork Chop Rice", "Lu Rou Fan", "Oyster Pancake", "Scallion Pancake", "Stinky Tofu Challenge",
      "Fine Dining", "Michelin Dining", "Rooftop Dining", "Pop-up Dinner", "Dessert Omakase",
      "French Bistro", "Italian Trattoria", "Mediterranean Feast", "Curry Night", "Mexican Street Food",
      "Tapas Bar", "Oyster Bar", "Beef Burger Bar", "Pizza Night", "Charcuterie Date",
      "Craft Beer", "Draft Beer Pub", "Beer Garden",
      "Wine Tasting", "Wine Bar", "Natural Wine Bar", "Champagne Bar",
      "Cocktail Bar", "Sake Bar", "Sake Tasting", "Whisky Bar", "Whisky Tasting",
      "Gin Bar", "Rum Bar", "Mocktail Bar", "Listening Bar",
      "Specialty Coffee", "Espresso Bar", "Coffee Tasting", "Cold Brew Café",
      "Matcha Café", "Vegan Café", "Smoothie Bar", "Hot Chocolate Café",
      "Dessert Bar", "Pastry Tour", "Donut Café", "Cheese Board", "Bakery Hopping",
      "Cat Café", "Afternoon Tea", "Bubble Waffle",
      "Tteokbokki", "Korean Fried Chicken", "Bingsoo", "Tanghulu Walk", "Egg Tart Café",
      "Kimchi Making Class", "Soup Dumplings", "Cheese Making Class", "Braised Beef Brisket",
    ],
  },
  {
    label: "Arts & Culture",
    items: [
      "Art Gallery", "Photography Exhibition", "Pop Art Exhibition", "Illustration Exhibition", "Sculpture Garden",
      "Museum", "Night Museum", "Science Museum", "Design Museum", "Natural History Museum", "Toy Museum",
      "Film", "Art House Cinema", "Rooftop Cinema", "Outdoor Cinema", "Film Club",
      "Live Music", "Jazz Club", "Classical Concert", "Traditional Music Concert", "Open Mic Night",
      "Theater", "Dance Performance", "Opera Night", "Ballet Performance", "Street Performance",
      "Puppet Theater", "Shadow Puppet Show",
      "Comedy Show", "Improv Show", "Drag Show", "Poetry Slam", "Spoken Word Night", "Storytelling Night",
      "Street Art Tour", "Mural Walk", "Graffiti Tour", "Light Art Installation", "Animation Exhibition",
      "Architecture Walk", "History Walk", "Photography Walk", "Night Photography Walk",
      "Temple Visit", "Indigenous Culture", "Cultural Festival", "Lantern Making", "Paper Cutting Art",
      "Tea Ceremony", "Calligraphy",
      "Vinyl Record Shop", "Record Store Digging", "Manga Café", "Anime Screening",
      "Antique Market", "Indie Market", "Zine Fair", "Craft Fair", "Flea Market",
      "Bookstore", "Book Café", "Library Date",
      "Fashion Show", "Cosplay Event", "Planetarium",
      "Illustration Class", "Graffiti Tour", "Animation Exhibition",
    ],
  },
  {
    label: "Creative & Hands-on",
    items: [
      "Pottery Class", "Glass Blowing", "Stained Glass", "Mosaic Making",
      "Painting Workshop", "Watercolor Class", "Acrylic Pour", "Life Drawing Class",
      "Printmaking", "Screen Printing", "Linocut Printing", "Paper Marbling", "Cyanotype Printing",
      "Origami Workshop", "Origami Art Night", "Calligraphy Workshop", "Paper Cutting Art",
      "Terrarium Making", "Resin Art", "Polymer Clay Art", "Decoupage", "Collage Making",
      "Jewelry Making", "Wire Jewelry", "Leather Craft",
      "Candle Making", "Soap Making", "Perfume Blending",
      "Flower Arranging", "Ikebana",
      "Embroidery", "Weaving Workshop", "Macramé", "Felting Workshop",
      "Tie-dye Workshop", "Batik Workshop", "Natural Dyeing",
      "Cooking Class", "Sushi Making", "Pasta Making", "Bread Baking",
      "Baking Class", "Cake Decorating", "Macaron Making", "Cookie Decorating",
      "Chocolate Making", "Mochi Making", "Dumpling Making", "Jam Making",
      "Cocktail Making Class", "Beer Brewing Workshop", "Coffee Brewing Class",
      "Dance Class", "Ukulele Class", "Music Jam Session",
      "Kintsugi Workshop", "Bookbinding", "Stamp Carving", "Dreamcatcher Making",
      "Neon Sign Making", "Terrarium Date", "Film Photography",
      "Creative Writing", "Zine Making Workshop", "DIY Craft",
    ],
  },
  {
    label: "Entertainment",
    items: [
      "Karaoke", "Escape Room", "VR Escape Room",
      "Bowling", "Arcade", "Retro Gaming Bar", "Claw Machine Café", "Pinball Bar",
      "VR Gaming", "Laser Tag", "Paintball", "Rage Room",
      "Mini Golf", "Glow Golf", "Billiards", "Ping Pong Bar", "Shuffleboard Bar", "Dart Bar",
      "Archery", "Axe Throwing", "Go-Kart Racing", "Shooting Range", "Batting Cage",
      "Trampoline Park", "Inflatable Park", "Ice Skating", "Roller Skating", "Skate Park",
      "Board Games", "Pub Quiz", "Trivia Night", "Trivia Bar Crawl",
      "Murder Mystery Dinner", "Dinner Theater", "Scavenger Hunt", "City Rally",
      "Magic Show", "Haunted House", "Circus Show",
      "Silent Disco", "Speed Dating", "Cosplay Meetup",
      "Amusement Park", "Waterpark",
      "Self Photo Studio", "Photo Booth Tour", "Night Bus Tour",
      "Puzzle Café", "Badminton", "Table Tennis",
    ],
  },
  {
    label: "Active & Outdoor",
    items: [
      "Mountain Hiking", "Waterfall Hike", "Sunrise Hike", "Full Moon Hike", "Trail Running",
      "Yangmingshan Day Trip", "Elephant Mountain", "Maokong Gondola",
      "River Cycling", "Night Cycling", "Longboarding", "Scooter Tour",
      "Kayaking", "Stand-up Paddleboard", "Boat Trip", "Sunset Cruise",
      "Rock Climbing", "Zip Line", "Horseback Riding",
      "Picnic", "Cherry Blossom Picnic", "Beach Volleyball", "Frisbee Park", "Kite Flying",
      "Riverside Walk", "River Walk", "Coastal Walk", "Tree Canopy Walk", "Urban Exploration",
      "Bird Watching", "Firefly Watching", "Foraging Walk", "Outdoor Yoga",
      "Botanical Garden", "Butterfly Garden", "Sculpture Garden",
      "Hot Springs", "Glamping", "Camping", "Farm Visit", "Strawberry Picking",
      "Night Fishing", "Night Run", "Night Safari", "Beach Day",
      "Zoo Date", "Aquarium Visit",
      "Stargazing", "Meteor Shower Watch", "Sunset Watching", "Sunrise Watch", "Dawn Walk",
      "Cycling Tour", "E-bike Tour", "Swimming", "Wakeboarding", "Paddleboarding Tour",
      "Jiufen Day Trip", "Danshui Old Street", "Lantern Festival", "MRT Hopping",
    ],
  },
  {
    label: "Chill & Wellness",
    items: [
      "Spa & Wellness", "Couples Massage", "Foot Massage", "Gua Sha Facial", "Couples Skincare",
      "Sauna", "Infrared Sauna", "Contrast Therapy", "Float Tank", "Sound Bath", "Hammam",
      "Yoga", "Hot Yoga", "Aerial Yoga", "Pilates Class", "Barre Class", "Breathwork", "Meditation Class",
      "Forest Bathing", "Reiki Session", "Chakra Workshop", "Herbal Tea Tasting",
      "Nail Art", "Crystal Shopping", "Plant Shopping", "Flower Market Visit",
      "Tarot Reading", "Astrology Reading", "Oracle Card Reading", "Aura Photography",
      "Journaling Café", "Garden Café", "Greenhouse Café", "Hammock Park",
      "Pet Café", "Rooftop Café", "Shopping", "Digital Detox Day", "Xinyi Nightlife",
      "Jimjilbang", "Korean Spa", "Bath Bomb Making", "Sound Healing", "Eye Mask Café",
    ],
  },
];

// Items dimmed when selected filters clearly don't match
const ITEM_CONSTRAINTS: Record<string, { budgets?: string[]; times?: string[] }> = {
  // Morning-only
  "Sunrise Hike":       { times: ["Morning"] },
  "Sunrise Watch":      { times: ["Morning"] },
  "Dawn Walk":          { times: ["Morning"] },
  "Dim Sum Brunch":     { times: ["Morning", "Afternoon"] },
  "Taiwanese Breakfast":{ times: ["Morning", "Afternoon"] },
  "Brunch":             { times: ["Morning", "Afternoon"] },
  "Waffle Café":        { times: ["Morning", "Afternoon"] },
  "Outdoor Yoga":       { times: ["Morning", "Afternoon"] },
  // Evening / Late night
  "Karaoke":            { times: ["Evening", "Late night"] },
  "Xinyi Nightlife":    { times: ["Evening", "Late night"] },
  "Drag Show":          { times: ["Evening", "Late night"] },
  "Silent Disco":       { times: ["Evening", "Late night"] },
  "Pub Quiz":           { times: ["Evening", "Late night"] },
  "Trivia Night":       { times: ["Evening", "Late night"] },
  "Trivia Bar Crawl":   { times: ["Evening", "Late night"] },
  "Night Market Crawl": { times: ["Evening", "Late night"], budgets: ["$", "$$"] },
  "Night Museum":       { times: ["Evening"] },
  "Night Cycling":      { times: ["Evening", "Late night"] },
  "Night Run":          { times: ["Evening", "Late night"] },
  "Night Fishing":      { times: ["Evening", "Late night"] },
  "Night Safari":       { times: ["Evening", "Late night"] },
  "Night Photography Walk": { times: ["Evening", "Late night"] },
  "Full Moon Hike":     { times: ["Evening", "Late night"] },
  "Stargazing":         { times: ["Evening", "Late night"] },
  "Meteor Shower Watch":{ times: ["Late night"] },
  "Firefly Watching":   { times: ["Evening", "Late night"] },
  "Sunset Watching":    { times: ["Afternoon", "Evening"] },
  "Sunset Cruise":      { times: ["Afternoon", "Evening"] },
  "Live Music":         { times: ["Evening", "Late night"] },
  "Jazz Club":          { times: ["Evening", "Late night"] },
  "Cocktail Bar":       { times: ["Evening", "Late night"] },
  "Whisky Bar":         { times: ["Evening", "Late night"] },
  "Whisky Tasting":     { times: ["Evening", "Late night"] },
  "Listening Bar":      { times: ["Evening", "Late night"] },
  "Champagne Bar":      { times: ["Evening", "Late night"], budgets: ["$$$", "$$$$"] },
  "Sake Bar":           { times: ["Evening", "Late night"] },
  "Sake Tasting":       { times: ["Evening", "Late night"] },
  "Gin Bar":            { times: ["Evening", "Late night"] },
  "Rum Bar":            { times: ["Evening", "Late night"] },
  "Haunted House":      { times: ["Evening", "Late night"] },
  "Night Bus Tour":     { times: ["Evening", "Late night"] },
  "Speed Dating":       { times: ["Evening"] },
  "Circus Show":        { times: ["Afternoon", "Evening"] },
  "Opera Night":        { times: ["Evening"] },
  "Ballet Performance": { times: ["Afternoon", "Evening"] },
  // Budget constraints
  "Michelin Dining":    { budgets: ["$$$", "$$$$"] },
  "Fine Dining":        { budgets: ["$$$", "$$$$"] },
  "Omakase":            { budgets: ["$$$", "$$$$"] },
  "Dessert Omakase":    { budgets: ["$$$", "$$$$"] },
  "Rooftop Dining":     { budgets: ["$$", "$$$", "$$$$"] },
  "Pop-up Dinner":      { budgets: ["$$$", "$$$$"] },
  "Fondue Night":       { budgets: ["$$", "$$$", "$$$$"] },
  "Charcuterie Date":   { budgets: ["$$", "$$$", "$$$$"] },
  "Street Food":        { budgets: ["$", "$$"] },
  "Night Market":       { budgets: ["$", "$$"] },
  "Stinky Tofu Challenge": { budgets: ["$", "$$"] },
  "Pork Chop Rice":     { budgets: ["$", "$$"] },
  "Lu Rou Fan":         { budgets: ["$", "$$"] },
  "Oyster Pancake":     { budgets: ["$", "$$"] },
  "Scallion Pancake":   { budgets: ["$", "$$"] },
  "Taiyaki Walk":       { budgets: ["$", "$$"] },
  "Soft Serve Walk":    { budgets: ["$", "$$"] },
};

interface Venue {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  price_level?: number;
  photo?: string;
  maps_link: string;
  tip?: string;
}

export default function IdeasPage() {
  const [neighbourhood, setNeighbourhood] = useState("All Taipei");
  const [budget, setBudget] = useState("$$ Medium (NT$300-800)");
  const [vibe, setVibe] = useState("Casual");
  const [timeOfDay, setTimeOfDay] = useState("Any time");
  const [interests, setInterests] = useState<string[]>([]);
  const [showInterests, setShowInterests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [relevantCount, setRelevantCount] = useState(0);
  const [searched, setSearched] = useState(false);
  const [schedulingVenue, setSchedulingVenue] = useState<Venue | null>(null);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedNotes, setSchedNotes] = useState("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const budgetLevel = budget.match(/^\$+/)?.[0] ?? "$$";

  function isItemMismatch(item: string): boolean {
    const c = ITEM_CONSTRAINTS[item];
    if (!c) return false;
    if (c.budgets && !c.budgets.includes(budgetLevel)) return true;
    if (c.times && timeOfDay !== "Any time" && !c.times.includes(timeOfDay)) return true;
    return false;
  }

  function handleAddToSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!schedulingVenue) return;
    addToSchedule({
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

  function toggleInterest(i: string) {
    if (isItemMismatch(i)) return;
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  async function findSpots() {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/find-date-spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ neighbourhood, budget, vibe, timeOfDay, interests }),
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="text-sm text-[#be3a4a] font-medium mb-1">📍 Taipei City, Taiwan</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Date Idea Generator</h1>
      <p className="text-gray-500 mb-8">Real Taipei venues, tuned to your vibe — photos & reservation links powered by AI.</p>

      {/* Filter card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
          ⚙ Filters
        </div>

        {/* Neighbourhood */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Neighbourhood</label>
          <div className="flex flex-wrap gap-2">
            {NEIGHBOURHOODS.map((n) => (
              <button
                key={n}
                onClick={() => setNeighbourhood(n)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  neighbourhood === n
                    ? "bg-[#be3a4a] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Budget / Vibe / Time */}
        <div className="grid grid-cols-3 gap-4 mb-5">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day</label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#be3a4a]"
            >
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Interests toggle */}
        <div className="mb-5">
          <button
            onClick={() => setShowInterests((v) => !v)}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 mb-2"
          >
            {showInterests ? "▾" : "▸"} Interests
            {interests.length > 0 && (
              <span className="ml-1 bg-[#be3a4a] text-white rounded-full px-1.5 py-0.5 text-xs">
                {interests.length}
              </span>
            )}
          </button>
          {showInterests && (
            <div className="space-y-4">
              {INTEREST_CATEGORIES.map(({ label, items }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((i) => {
                      const mismatch = isItemMismatch(i);
                      const selected = interests.includes(i);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleInterest(i)}
                          title={mismatch ? "Doesn't fit your current budget or time" : undefined}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            selected
                              ? "bg-[#be3a4a] text-white"
                              : mismatch
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-40"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={findSpots}
          disabled={loading}
          className="bg-[#be3a4a] text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-[#a3303f] transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finding spots...
            </>
          ) : (
            "✦ Find Date Spots"
          )}
        </button>
      </div>

      {/* Results */}
      {searched && !loading && (
        <div>
          {venues.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No venues found. Try a different neighbourhood or vibe.</p>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">
                {relevantCount > 0 && interests.length > 0
                  ? `${relevantCount} matched · ${venues.length - relevantCount} more nearby`
                  : `${venues.length} spots found`}
              </p>
              <div className="flex flex-col gap-4">
                {venues.map((v, idx) => (
                  <div key={v.place_id}>
                    {/* Divider between matched results and broader context results */}
                    {interests.length > 0 && idx === relevantCount && relevantCount > 0 && venues.length > relevantCount && (
                      <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">More nearby</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
                      {v.photo && (
                        <img
                          src={v.photo}
                          alt={v.name}
                          className="w-32 h-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">{v.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 ml-2 flex-shrink-0">
                            {v.rating && <span>★ {v.rating}</span>}
                            {v.price_level && <span>{"$".repeat(v.price_level)}</span>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">📍 {v.address}</p>
                        {v.tip && (
                          <p className="text-sm text-gray-600 mb-3 flex gap-1.5">
                            <span className="text-[#be3a4a]">✦</span>
                            {v.tip}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <a
                            href={v.maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[#be3a4a] font-medium hover:underline"
                          >
                            View on Maps →
                          </a>
                          {addedIds.has(v.place_id) ? (
                            <span className="text-sm text-green-600 font-medium">✓ Added</span>
                          ) : (
                            <button
                              onClick={() => setSchedulingVenue(v)}
                              className="text-sm text-gray-500 font-medium hover:text-[#be3a4a] transition-colors border border-gray-200 rounded-full px-3 py-0.5 hover:border-[#be3a4a]"
                            >
                              + Schedule
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Add to schedule modal */}
      {schedulingVenue && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSchedulingVenue(null); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Add to Schedule</h2>
            <p className="text-sm text-gray-500 mb-5">{schedulingVenue.name}</p>
            <form onSubmit={handleAddToSchedule} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Time</label>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a]"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                <textarea
                  value={schedNotes}
                  onChange={(e) => setSchedNotes(e.target.value)}
                  placeholder="Any reminders or ideas..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#be3a4a] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSchedulingVenue(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#be3a4a] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#a3303f] transition-colors"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

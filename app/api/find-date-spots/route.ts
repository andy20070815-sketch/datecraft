import { NextRequest, NextResponse } from "next/server";

const NEIGHBOURHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  "All Taipei": { lat: 25.033,   lng: 121.5654 },
  "Da-an":      { lat: 25.0269,  lng: 121.5432 },
  Xinyi:        { lat: 25.0357,  lng: 121.5654 },
  Zhongshan:    { lat: 25.0638,  lng: 121.5217 },
  Shilin:       { lat: 25.0878,  lng: 121.5245 },
  Beitou:       { lat: 25.1317,  lng: 121.5021 },
  Songshan:     { lat: 25.0497,  lng: 121.5768 },
  Wanhua:       { lat: 25.0336,  lng: 121.4997 },
  Neihu:        { lat: 25.0794,  lng: 121.5908 },
  Tamsui:       { lat: 25.1699,  lng: 121.4449 },
};

const BUDGET_TO_PRICE_LEVELS: Record<string, string[]> = {
  "$ Budget (NT$0-300)":       ["PRICE_LEVEL_INEXPENSIVE"],
  "$$ Medium (NT$300-800)":    ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"],
  "$$$ Upscale (NT$800-2000)": ["PRICE_LEVEL_MODERATE",    "PRICE_LEVEL_EXPENSIVE"],
  "$$$$ Luxury (NT$2000+)":    ["PRICE_LEVEL_EXPENSIVE",   "PRICE_LEVEL_VERY_EXPENSIVE"],
};

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

// Maps each interest to the Google place type that should constrain the search.
// Without this, "Mountain Hiking Taipei" returns restaurants near parks.
const INTEREST_TYPE: Record<string, string> = {
  // Restaurants
  ...Object.fromEntries([
    "Hotpot","Shabu Shabu","Seafood Hot Pot","Ramen","Dim Sum","Vietnamese Pho",
    "Beef Noodle Soup","Fine Dining","Omakase","Michelin Dining","Rooftop Dining",
    "Izakaya","Korean BBQ","Teppanyaki","Tapas Bar","Oyster Bar","Sushi Bar",
    "Yakitori Bar","Robatayaki","Tonkatsu","Gyoza Bar","Pork Chop Rice","Lu Rou Fan",
    "Oyster Pancake","Scallion Pancake","Stinky Tofu Challenge","Beef Burger Bar",
    "Pizza Night","French Bistro","Italian Trattoria","Mediterranean Feast",
    "Curry Night","Mexican Street Food","Sukiyaki","Fondue Night","Dim Sum Brunch",
    "Street Food","Food Tour","Night Market","Night Market Crawl","Food Market",
    "Cooking Class","Sushi Making","Pasta Making","Murder Mystery Dinner",
    "Dinner Theater","Pop-up Dinner","Charcuterie Date",
    "Soup Dumplings","Tteokbokki","Korean Fried Chicken","Bingsoo",
    "Kimchi Making Class","Mochi Making","Dumpling Making","Cheese Making Class",
    "Braised Beef Brisket",
  ].map((k) => [k, "restaurant"])),
  // Bars
  ...Object.fromEntries([
    "Craft Beer","Draft Beer Pub","Beer Garden","Wine Tasting","Wine Bar",
    "Natural Wine Bar","Cocktail Bar","Champagne Bar","Sake Bar","Sake Tasting",
    "Whisky Bar","Whisky Tasting","Gin Bar","Rum Bar","Mocktail Bar","Listening Bar",
    "Jazz Club","Live Music","Open Mic Night","Poetry Slam","Drag Show",
    "Pub Quiz","Trivia Night","Trivia Bar Crawl","Dart Bar","Billiards",
    "Cheese Board","Cocktail Making Class","Beer Brewing Workshop","Music Jam Session",
    "Storytelling Night","Spoken Word Night","Retro Gaming Bar","Ping Pong Bar",
    "Shuffleboard Bar","Speed Dating","Silent Disco",
  ].map((k) => [k, "bar"])),
  // Cafes
  ...Object.fromEntries([
    "Specialty Coffee","Espresso Bar","Coffee Tasting","Cold Brew Café","Matcha Café",
    "Vegan Café","Smoothie Bar","Dessert Bar","Hot Chocolate Café","Cat Café",
    "Afternoon Tea","Bubble Tea","Mango Shaved Ice","Ice Cream Walk","Soft Serve Walk",
    "Taiyaki Walk","Brunch","Taiwanese Breakfast","Waffle Café","Crepe Café",
    "Donut Café","Dessert Omakase","Pastry Tour","Bubble Waffle","Book Café",
    "Manga Café","Rooftop Café","Journaling Café","Garden Café","Greenhouse Café",
    "Herbal Tea Tasting","Coffee Brewing Class","Tea Ceremony","Chocolate Making",
    "Pet Café","Board Games","Creative Writing",
    "Tanghulu Walk","Egg Tart Café","Eye Mask Café","Puzzle Café",
  ].map((k) => [k, "cafe"])),
  // Bakeries
  "Bakery Hopping": "bakery", "Baking Class": "bakery", "Bread Baking": "bakery",
  "Cake Decorating": "bakery", "Macaron Making": "bakery", "Cookie Decorating": "bakery",
  // Parks / outdoor
  ...Object.fromEntries([
    "Mountain Hiking","Waterfall Hike","Sunrise Hike","Full Moon Hike","Trail Running",
    "River Cycling","Night Cycling","Frisbee Park","Kite Flying","Kayaking",
    "Stand-up Paddleboard","Picnic","Cherry Blossom Picnic","Riverside Walk",
    "River Walk","Coastal Walk","Bird Watching","Firefly Watching","Botanical Garden",
    "Night Fishing","Night Run","Beach Day","Stargazing","Meteor Shower Watch",
    "Sunset Watching","Sunrise Watch","Foraging Walk","Tree Canopy Walk",
    "Longboarding","Camping","Hammock Park","Outdoor Yoga","Beach Volleyball",
    "Forest Bathing","Dawn Walk","Skate Park","Sculpture Garden","Urban Exploration",
    "Yangmingshan Day Trip","Elephant Mountain",
  ].map((k) => [k, "park"])),
  // Museums
  ...Object.fromEntries([
    "Museum","Science Museum","Design Museum","Natural History Museum","Toy Museum","Night Museum",
  ].map((k) => [k, "museum"])),
  // Art galleries
  ...Object.fromEntries([
    "Art Gallery","Photography Exhibition","Pop Art Exhibition","Illustration Exhibition",
    "Light Art Installation","Painting Workshop","Watercolor Class","Life Drawing Class",
    "Animation Exhibition","Illustration Class","Acrylic Pour",
  ].map((k) => [k, "art_gallery"])),
  // Movie theaters
  ...Object.fromEntries([
    "Film","Theater","Art House Cinema","Rooftop Cinema","Outdoor Cinema","Film Club","Anime Screening",
  ].map((k) => [k, "movie_theater"])),
  // Comedy clubs
  "Comedy Show": "comedy_club", "Improv Show": "comedy_club",
  // Spas / wellness
  ...Object.fromEntries([
    "Spa & Wellness","Couples Massage","Foot Massage","Sauna","Infrared Sauna",
    "Float Tank","Sound Bath","Hammam","Contrast Therapy","Reiki Session",
    "Chakra Workshop","Couples Skincare","Gua Sha Facial","Hot Springs",
    "Jimjilbang","Korean Spa","Bath Bomb Making","Sound Healing","Perfume Blending",
  ].map((k) => [k, "spa"])),
  // Gyms / fitness
  ...Object.fromEntries([
    "Yoga","Hot Yoga","Aerial Yoga","Pilates Class","Barre Class","Breathwork",
    "Meditation Class","Dance Class","Rock Climbing","Badminton","Table Tennis",
    "Ukulele Class","Swimming","Boxing Class","Muay Thai Class","Fencing Class",
    "Wrestling Class","Indoor Basketball","Indoor Rock Climbing","Bouldering",
    "Parkour Class","Acrobatics Class","Gymnastics Class",
  ].map((k) => [k, "gym"])),
  // Specific place types
  "Karaoke": "karaoke",
  "Bowling": "bowling_alley",
  "Shopping": "shopping_mall", "Antique Market": "shopping_mall", "Indie Market": "shopping_mall",
  "Flea Market": "shopping_mall", "Craft Fair": "shopping_mall",
  "Nail Art": "beauty_salon",
  "Zoo Date": "zoo", "Night Safari": "zoo",
  "Aquarium Visit": "tourist_attraction",
  "Flower Arranging": "florist", "Ikebana": "florist",
  "Plant Shopping": "florist", "Flower Market Visit": "florist",
  "Bookstore": "book_store", "Vinyl Record Shop": "book_store",
  "Record Store Digging": "book_store",
  // Amusement / entertainment centres
  ...Object.fromEntries([
    "Escape Room","VR Escape Room","Arcade","VR Gaming","Mini Golf","Glow Golf",
    "Laser Tag","Paintball","Archery","Go-Kart Racing","Axe Throwing","Shooting Range",
    "Trampoline Park","Inflatable Park","Rage Room","Claw Machine Café","Pinball Bar",
    "Batting Cage","Neon Sign Making","Indoor Skydiving","Indoor Snowboarding","Indoor Surfing",
  ].map((k) => [k, "amusement_center"])),
  // Amusement parks
  "Amusement Park": "amusement_park", "Waterpark": "amusement_park",
  // Florists
  "Crystal Shopping": "tourist_attraction",
  // Tourist attractions (specific enough that text search handles it)
  "Maokong Gondola": "tourist_attraction", "Jiufen Day Trip": "tourist_attraction",
  "Danshui Old Street": "tourist_attraction", "Elephant Mountain": "tourist_attraction",
  "Horseback Riding": "tourist_attraction", "Sunset Cruise": "tourist_attraction",
  "Boat Trip": "tourist_attraction", "Glamping": "tourist_attraction",
  "Strawberry Picking": "tourist_attraction", "Farm Visit": "tourist_attraction",
  "Scooter Tour": "tourist_attraction", "Lantern Making": "tourist_attraction",
  "Paper Cutting Art": "tourist_attraction", "Cosplay Event": "tourist_attraction",
  "Planetarium": "tourist_attraction", "Fashion Show": "tourist_attraction",
  "Library Date": "tourist_attraction", "Zine Fair": "tourist_attraction",
  "Night Bus Tour": "tourist_attraction", "Scavenger Hunt": "tourist_attraction",
  "City Rally": "tourist_attraction", "Architecture Walk": "tourist_attraction",
  "History Walk": "tourist_attraction", "Photography Walk": "tourist_attraction",
  "Street Art Tour": "tourist_attraction", "Mural Walk": "tourist_attraction",
  "Temple Visit": "tourist_attraction", "Indigenous Culture": "tourist_attraction",
  "Cultural Festival": "tourist_attraction", "Classical Concert": "tourist_attraction",
  "Opera Night": "tourist_attraction", "Ballet Performance": "tourist_attraction",
  "Dance Performance": "tourist_attraction", "Circus Show": "tourist_attraction",
  "Magic Show": "tourist_attraction", "Haunted House": "tourist_attraction",
  "Ice Skating": "tourist_attraction", "Roller Skating": "tourist_attraction",
  "Zip Line": "tourist_attraction", "Butterfly Garden": "tourist_attraction",
  // New craft & workshop experiences
  "Kintsugi Workshop": "tourist_attraction", "Bookbinding": "tourist_attraction",
  "Stamp Carving": "tourist_attraction", "Dreamcatcher Making": "tourist_attraction",
  "Terrarium Date": "tourist_attraction", "Film Photography": "tourist_attraction",
  "Self Photo Studio": "tourist_attraction",
  // New outdoor activities
  "Cycling Tour": "tourist_attraction", "E-bike Tour": "tourist_attraction",
  "Wakeboarding": "tourist_attraction", "Paddleboarding Tour": "tourist_attraction",
  "Bungee Jumping": "tourist_attraction", "Paragliding": "tourist_attraction",
  "Hot Air Balloon": "tourist_attraction", "Scuba Diving": "tourist_attraction",
  "Snorkeling": "tourist_attraction", "Freediving": "tourist_attraction",
  "Surfing": "tourist_attraction", "Kitesurfing": "tourist_attraction",
  "Wakeskating": "tourist_attraction", "Longboarding Tour": "tourist_attraction",
  "BMX Park": "park", "Skateboarding": "park",
  // New cultural
  "Graffiti Tour": "tourist_attraction", "Lantern Festival": "tourist_attraction",
  "MRT Hopping": "tourist_attraction", "Xinyi Nightlife": "bar",
  // Wellness & spiritual
  "Tarot Reading": "tourist_attraction", "Astrology Reading": "tourist_attraction",
  "Oracle Card Reading": "tourist_attraction", "Aura Photography": "tourist_attraction",
};

// Restricts the vibe context query to the most relevant place category
const VIBE_TYPE: Record<string, string> = {
  Adventurous: "park",
  Cultural:    "tourist_attraction",
  Foodie:      "restaurant",
  Nightlife:   "bar",
  // Casual / Romantic → no restriction (intentionally omitted)
};

interface NewPlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  priceLevel?: string;
  photos?: { name: string }[];
  googleMapsUri?: string;
}

// Price levels only apply to commercial venues; parks, museums, etc. have no price data in Google
const PRICE_LEVEL_TYPES = new Set([
  "restaurant","bar","cafe","spa","gym","karaoke","bowling_alley",
  "beauty_salon","amusement_center","amusement_park","movie_theater","bakery","shopping_mall",
]);

async function searchText(
  query: string,
  lat: number,
  lng: number,
  priceLevels: string[],
  includedType?: string
): Promise<NewPlace[]> {
  const applyPriceLevels = priceLevels.length > 0 && (!includedType || PRICE_LEVEL_TYPES.has(includedType));
  const body: Record<string, unknown> = {
    textQuery: query,
    maxResultCount: 20,
    locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 4000 } },
  };
  if (applyPriceLevels) body.priceLevels = priceLevels;
  if (includedType) body.includedType = includedType;

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.photos,places.googleMapsUri",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data.places ?? [];
  } catch {
    return [];
  }
}

function getPhotoUrl(name: string) {
  return `https://places.googleapis.com/v1/${name}/media?maxWidthPx=600&key=${process.env.GOOGLE_PLACES_API_KEY}`;
}

export async function POST(req: NextRequest) {
  const { neighbourhood, budget, vibe, timeOfDay, interests } = await req.json();

  const coords       = NEIGHBOURHOOD_COORDS[neighbourhood] ?? NEIGHBOURHOOD_COORDS["All Taipei"];
  const priceLevels  = BUDGET_TO_PRICE_LEVELS[budget] ?? [];
  const loc          = neighbourhood === "All Taipei" ? "Taipei" : `${neighbourhood} Taipei`;
  const interestList: string[] = interests ?? [];

  // Interest queries: each fires with its strict place-type constraint
  const interestQueries = interestList.slice(0, 15).map((i) => ({
    query: `${i} ${loc}`,
    type:  INTEREST_TYPE[i],        // undefined = no type restriction (workshops, unique spots)
  }));

  // Context queries: broad vibe/time fallback, also type-constrained where sensible
  const contextQueries = [
    { query: `${vibe} date spot ${loc}`,      type: VIBE_TYPE[vibe] },
    ...(timeOfDay !== "Any time"
      ? [{ query: `${timeOfDay} ${vibe} ${loc}`, type: VIBE_TYPE[vibe] }]
      : []),
  ];

  // Fire all in parallel
  const [interestSets, contextSets] = await Promise.all([
    Promise.all(interestQueries.map(({ query, type }) =>
      searchText(query, coords.lat, coords.lng, priceLevels, type)
    )),
    Promise.all(contextQueries.map(({ query, type }) =>
      searchText(query, coords.lat, coords.lng, priceLevels, type)
    )),
  ]);

  // Score: +1 per interest query that returned this place
  const scoreMap = new Map<string, number>();
  const placeMap = new Map<string, NewPlace>();

  interestSets.forEach((set) =>
    set.forEach((p) => {
      if (!p.id || !p.displayName?.text) return;
      placeMap.set(p.id, p);
      scoreMap.set(p.id, (scoreMap.get(p.id) ?? 0) + 1);
    })
  );
  contextSets.forEach((set) =>
    set.forEach((p) => {
      if (!p.id || !p.displayName?.text) return;
      placeMap.set(p.id, p);
      if (!scoreMap.has(p.id)) scoreMap.set(p.id, 0);
    })
  );

  // Top up if price filtering left too few results
  if (placeMap.size < 6) {
    const fallback = await searchText(`${vibe} ${loc}`, coords.lat, coords.lng, [], VIBE_TYPE[vibe]);
    fallback.forEach((p) => {
      if (!p.id || !p.displayName?.text || placeMap.has(p.id)) return;
      placeMap.set(p.id, p);
      scoreMap.set(p.id, 0);
    });
  }

  if (placeMap.size === 0) return NextResponse.json({ venues: [], relevantCount: 0 });

  // Sort: interest match score (desc) → rating (desc)
  const sorted = [...placeMap.values()].sort((a, b) => {
    const sa = scoreMap.get(a.id) ?? 0;
    const sb = scoreMap.get(b.id) ?? 0;
    if (sb !== sa) return sb - sa;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });

  const relevantCount = interestList.length > 0
    ? sorted.filter((p) => (scoreMap.get(p.id) ?? 0) > 0).length
    : sorted.length;

  const venues = sorted.map((p) => ({
    place_id:    p.id,
    name:        p.displayName!.text,
    address:     p.formattedAddress ?? "",
    rating:      p.rating,
    price_level: p.priceLevel ? PRICE_LEVEL_MAP[p.priceLevel] ?? 2 : 2,
    photo:       p.photos?.[0]?.name ? getPhotoUrl(p.photos[0].name) : null,
    maps_link:   p.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${p.id}`,
  }));

  return NextResponse.json({ venues, relevantCount });
}

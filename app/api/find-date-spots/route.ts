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
    "Braised Beef Brisket","Steakhouse","Wagyu Beef Dinner","AYCE Buffet",
    "Hot Pot Buffet","Vegetarian Restaurant",
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
    "Sports Bar","Sky Bar","Rooftop Bar","Hotel Bar",
    "Electronic Music Night","Darts League","Sports Viewing",
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
    "Tanghulu Walk","Egg Tart Café","Eye Mask Café","Puzzle Café","E-Sports Café",
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
    "Botanical Illustration","Art Fair","Immersive Exhibition",
  ].map((k) => [k, "art_gallery"])),
  // Movie theaters — only mainstream cinema types reliably tagged as movie_theater
  ...Object.fromEntries([
    "Film","Art House Cinema","Film Club","Anime Screening",
  ].map((k) => [k, "movie_theater"])),
  // Performance & comedy: no type restriction — these happen at bars, theaters, event spaces
  // "comedy_club" and "movie_theater" are too rare in Taipei to use as filters
  // (Comedy Show, Improv Show, Theater, Rooftop Cinema, Outdoor Cinema → unconstrained text search)
  // Spas / wellness
  ...Object.fromEntries([
    "Spa & Wellness","Couples Massage","Foot Massage","Sauna","Infrared Sauna",
    "Float Tank","Sound Bath","Hammam","Contrast Therapy","Reiki Session",
    "Chakra Workshop","Couples Skincare","Gua Sha Facial","Hot Springs",
    "Jimjilbang","Korean Spa","Bath Bomb Making","Sound Healing","Perfume Blending",
    "Thai Massage","Hot Stone Massage","Aromatherapy","Reflexology","Acupuncture",
    "Body Scrub","Facial Treatment",
  ].map((k) => [k, "spa"])),
  // Gyms / fitness
  ...Object.fromEntries([
    "Yoga","Hot Yoga","Aerial Yoga","Pilates Class","Barre Class","Breathwork",
    "Meditation Class","Dance Class","Rock Climbing","Badminton","Table Tennis","Tennis",
    "Swimming","Boxing Class","Muay Thai Class","Fencing Class","Wrestling Class",
    "Indoor Basketball","Indoor Rock Climbing","Bouldering","CrossFit","Fitness Boot Camp",
  ].map((k) => [k, "gym"])),
  // These studios have distinct enough names that no type restriction works better
  "Tai Chi": "park", "Aerial Arts": "tourist_attraction",
  "Capoeira": "tourist_attraction", "Parkour Class": "tourist_attraction",
  "Acrobatics Class": "tourist_attraction", "Gymnastics Class": "tourist_attraction",
  // Specific place types
  "Karaoke": "karaoke",
  "Bowling": "bowling_alley",
  "Shopping": "shopping_mall", "Antique Market": "shopping_mall", "Indie Market": "shopping_mall",
  "Flea Market": "shopping_mall", "Craft Fair": "shopping_mall",
  "Nail Art": "beauty_salon", "Hair Spa": "beauty_salon",
  "Manicure & Pedicure": "beauty_salon", "Eyelash Extension": "beauty_salon",
  "Brow Lamination": "beauty_salon", "Traditional Chinese Medicine": "beauty_salon",
  "Zoo Date": "zoo", "Night Safari": "zoo",
  "Aquarium Visit": "tourist_attraction",
  "Flower Arranging": "florist", "Ikebana": "florist",
  "Plant Shopping": "florist", "Flower Market Visit": "florist",
  "Bookstore": "book_store", "Vinyl Record Shop": "book_store",
  "Record Store Digging": "book_store",
  // amusement_center: only the activities Google reliably tags this way
  ...Object.fromEntries([
    "Escape Room","VR Escape Room","Arcade","VR Gaming",
    "Laser Tag","Trampoline Park","Inflatable Park","Rage Room",
    "Mini Golf","Glow Golf","Batting Cage","Rhythm Game",
  ].map((k) => [k, "amusement_center"])),
  // Sports/action venues: no type restriction — text query is specific enough
  // Paintball, Archery, Axe Throwing, Go-Kart Racing, Shooting Range intentionally omitted
  "Pinball Bar": "bar", "Claw Machine Café": "cafe", "Neon Sign Making": "tourist_attraction",
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
  "Ice Skating": "amusement_center", "Roller Skating": "amusement_center",
  "Zip Line": "tourist_attraction", "Butterfly Garden": "tourist_attraction",
  // New craft & workshop experiences
  "Kintsugi Workshop": "tourist_attraction", "Bookbinding": "tourist_attraction",
  "Stamp Carving": "tourist_attraction", "Dreamcatcher Making": "tourist_attraction",
  "Terrarium Date": "tourist_attraction", "Film Photography": "tourist_attraction",
  "Self Photo Studio": "tourist_attraction",
  // New outdoor activities
  "Cycling Tour": "tourist_attraction", "E-bike Tour": "tourist_attraction",
  "Wakeboarding": "tourist_attraction", "Paddleboarding Tour": "tourist_attraction",
  // Niche outdoor sports: no type restriction so text query finds the right operator
  "BMX Park": "park", "Skateboarding": "park", "Mountain Biking": "park",
  "Running Club": "park",
  "Golf Driving Range": "tourist_attraction", "Dragon Boat Racing": "tourist_attraction",
  "Rock Concert": "tourist_attraction", "Indie Concert": "tourist_attraction",
  "Music Festival": "tourist_attraction", "Immersive Theater": "tourist_attraction",
  "Karaoke Box": "karaoke", "Rhythm Game": "amusement_center",
  "Knitting Class": "tourist_attraction", "Crochet Workshop": "tourist_attraction",
  "Spray Paint Art": "tourist_attraction", "Digital Art Workshop": "tourist_attraction",
  "Ceramics Studio": "tourist_attraction",
  // New cultural
  "Graffiti Tour": "tourist_attraction", "Lantern Festival": "tourist_attraction",
  "MRT Hopping": "tourist_attraction", "Xinyi Nightlife": "bar",
  // Wellness & spiritual
  "Tarot Reading": "tourist_attraction", "Astrology Reading": "tourist_attraction",
  "Oracle Card Reading": "tourist_attraction", "Aura Photography": "tourist_attraction",
};

// Overrides the default "${interest} ${loc}" query with a more specific search string.
// Used for interests where the bare name returns poor Google results.
const SEARCH_QUERY: Record<string, string> = {
  // Sports & action
  "Archery":              "archery range bow arrow",
  "Axe Throwing":         "axe throwing venue",
  "Paintball":            "paintball field game",
  "Go-Kart Racing":       "go kart karting track",
  "Shooting Range":       "shooting range gun club",
  "Wrestling Class":      "wrestling gym combat sports",
  "Fencing Class":        "fencing swordsmanship club",
  "Muay Thai Class":      "muay thai kickboxing gym",
  "Capoeira":             "capoeira martial arts class",
  "Parkour Class":        "parkour freerunning class",
  "Acrobatics Class":     "acrobatics circus arts",
  "Gymnastics Class":     "gymnastics sports club",
  "Aerial Arts":          "aerial silks pole dance studio",
  "CrossFit":             "crossfit functional fitness gym",
  "Fitness Boot Camp":    "boot camp outdoor fitness training",
  "Dragon Boat Racing":   "dragon boat rowing club",
  "Golf Driving Range":   "golf driving range practice",
  "Mountain Biking":      "mountain bike trail cycling",
  "Running Club":         "running club marathon group",
  "Indoor Skydiving":     "indoor skydiving wind tunnel",
  "Indoor Snowboarding":  "indoor ski slope snow park",
  "Indoor Surfing":       "indoor surfing wave pool",
  "Wakeboarding":         "wakeboarding cable park",
  "Kitesurfing":          "kitesurfing kite school",
  "Scuba Diving":         "scuba diving PADI dive",
  "Snorkeling":           "snorkeling tour ocean",
  "Freediving":           "freediving apnea club",
  "Surfing":              "surfing lesson surf school",
  "Bungee Jumping":       "bungee jumping extreme sport",
  "Paragliding":          "paragliding tandem flight",
  "Hot Air Balloon":      "hot air balloon ride",
  "Zip Line":             "zip line canopy adventure",
  // Entertainment & performance
  "Comedy Show":          "脫口秀 stand-up comedy show",
  "Stand-up Comedy":      "脫口秀 stand-up comedy",
  "Improv Show":          "即興喜劇 improv comedy",
  "Drag Show":            "drag queen show performance",
  "Drag Brunch":          "drag brunch show entertainment",
  "Roast Night":          "comedy roast night",
  "Storytelling Night":   "storytelling event night",
  "Spoken Word Night":    "spoken word poetry event",
  "Immersive Theater":    "immersive experience theater",
  "Murder Mystery Dinner":"murder mystery dinner theater",
  "Dinner Theater":       "dinner show theater performance",
  "Magic Show":           "magic show illusionist",
  "Haunted House":        "haunted house horror experience",
  "Circus Show":          "circus acrobatics show",
  "Puppet Theater":       "puppet show theater",
  "Shadow Puppet Show":   "shadow puppet performance",
  "Ballet Performance":   "ballet dance performance",
  "Opera Night":          "opera classical performance",
  "Dance Performance":    "contemporary dance performance",
  "Classical Concert":    "classical music orchestra concert",
  "Traditional Music Concert": "traditional chinese music concert",
  "Rock Concert":         "rock live music concert band",
  "Indie Concert":        "indie live music band concert",
  "Electronic Music Night":"electronic DJ club music night",
  "Music Festival":       "music festival live outdoor concert",
  "Rooftop Cinema":       "rooftop outdoor cinema film screening",
  "Outdoor Cinema":       "outdoor cinema open air film",
  "Art House Cinema":     "art house indie cinema film",
  "Film Club":            "film club cinema screening",
  "Anime Screening":      "anime film screening club",
  // Creative workshops
  "Ceramics Studio":      "ceramics pottery studio class",
  "Kintsugi Workshop":    "kintsugi gold repair ceramics workshop",
  "Bookbinding":          "bookbinding paper craft workshop",
  "Stamp Carving":        "stamp carving hanko workshop",
  "Dreamcatcher Making":  "dreamcatcher making craft workshop",
  "Spray Paint Art":      "spray paint graffiti street art workshop",
  "Digital Art Workshop": "digital art illustration workshop",
  "Botanical Illustration":"botanical illustration drawing class",
  "Knitting Class":       "knitting yarn class workshop",
  "Crochet Workshop":     "crochet fiber craft workshop",
  "Neon Sign Making":     "neon sign making workshop",
  "Terrarium Date":       "terrarium making plant workshop",
  "Film Photography":     "film photography darkroom",
  "Zine Making Workshop": "zine making print workshop",
  "Paper Marbling":       "paper marbling ebru art",
  "Cyanotype Printing":   "cyanotype blueprint photography",
  "Linocut Printing":     "linocut relief printmaking",
  "Screen Printing":      "screen printing t-shirt workshop",
  "Resin Art":            "resin art epoxy workshop",
  "Polymer Clay Art":     "polymer clay sculpting workshop",
  "Decoupage":            "decoupage collage craft workshop",
  "Wire Jewelry":         "wire jewelry making workshop",
  "Leather Craft":        "leather craft bag making workshop",
  "Macramé":              "macrame fiber art workshop",
  "Felting Workshop":     "needle felting wool workshop",
  "Batik Workshop":       "batik fabric dyeing workshop",
  "Natural Dyeing":       "natural plant dyeing fabric",
  "Glass Blowing":        "glass blowing studio workshop",
  "Mosaic Making":        "mosaic tile art workshop",
  "Origami Workshop":     "origami paper folding workshop",
  "Calligraphy Workshop": "calligraphy brush writing class",
  // Arts & culture
  "Immersive Exhibition": "immersive art installation experience",
  "Light Art Installation":"light art installation exhibition",
  "Graffiti Tour":        "street art graffiti mural tour",
  "Street Art Tour":      "street art mural urban tour",
  "Architecture Walk":    "architecture heritage walking tour",
  "History Walk":         "history heritage walking tour",
  "Photography Walk":     "photography walking tour",
  "Night Photography Walk":"night photography tour city",
  "Art Fair":             "contemporary art fair gallery",
  "Zine Fair":            "zine indie publication fair",
  "Craft Fair":           "handmade craft artisan market",
  "Indigenous Culture":   "indigenous aboriginal cultural center",
  "Cultural Festival":    "cultural heritage festival event",
  "Lantern Making":       "lantern making craft workshop",
  "Paper Cutting Art":    "paper cutting jianzhi art",
  "Calligraphy":          "chinese calligraphy class brush",
  "Tea Ceremony":         "tea ceremony gongfu tea",
  "Library Date":         "public library reading room",
  "Scavenger Hunt":       "city scavenger hunt team game",
  "City Rally":           "city rally urban treasure hunt",
  "Night Bus Tour":       "city night sightseeing bus tour",
  "MRT Hopping":          "taipei MRT metro station",
  "Lantern Festival":     "sky lantern pingxi festival",
  // Chill & wellness
  "Sound Bath":           "sound bath gong singing bowl",
  "Sound Healing":        "sound healing frequency therapy",
  "Float Tank":           "float tank sensory deprivation REST",
  "Hammam":               "hammam turkish bath steam spa",
  "Contrast Therapy":     "contrast therapy cold plunge sauna",
  "Reiki Session":        "reiki energy healing session",
  "Chakra Workshop":      "chakra healing meditation workshop",
  "Forest Bathing":       "forest bathing shinrin-yoku nature walk",
  "Aura Photography":     "aura photography kirlian reading",
  "Tarot Reading":        "tarot card reading spiritual",
  "Astrology Reading":    "astrology birth chart reading",
  "Oracle Card Reading":  "oracle tarot card spiritual reading",
  "Traditional Chinese Medicine": "TCM acupuncture herbal medicine",
  "Bath Bomb Making":     "bath bomb soap making workshop",
  "Digital Detox Day":    "digital detox retreat wellness",
  "Jimjilbang":           "jimjilbang korean bathhouse sauna",
  // Outdoor / day trips
  "Waterfall Hike":       "waterfall hiking trail",
  "Full Moon Hike":       "night hiking full moon trail",
  "Sunrise Hike":         "sunrise hiking trail early morning",
  "Trail Running":        "trail running mountain path",
  "Bird Watching":        "birdwatching nature reserve",
  "Firefly Watching":     "firefly watching nature park",
  "Foraging Walk":        "foraging wild edible plants walk",
  "Tree Canopy Walk":     "treetop canopy walkway",
  "Urban Exploration":    "urban exploration abandoned building",
  "Glamping":             "glamping luxury camping",
  "Strawberry Picking":   "strawberry picking farm",
  "Night Fishing":        "night fishing pier lake",
  "Night Run":            "night running club group",
  "Night Safari":         "night zoo animal safari",
  "Horseback Riding":     "horseback riding equestrian stable",
  "Sunset Cruise":        "sunset boat cruise river",
  "Boat Trip":            "river boat tour cruise",
  "Scooter Tour":         "scooter rental tour city",
  "Kite Flying":          "kite flying park outdoor",
  "Beach Volleyball":     "beach volleyball court outdoor",
  // Food & drink specifics
  "Cheese Making Class":  "cheese making workshop class",
  "Kimchi Making Class":  "kimchi making fermentation class",
  "AYCE Buffet":          "all you can eat buffet restaurant",
  "Hot Pot Buffet":       "hot pot all you can eat buffet",
  "Wagyu Beef Dinner":    "wagyu beef premium steak restaurant",
  "Tanghulu Walk":        "tanghulu candied fruit street food",
  "Bingsoo":              "bingsu korean shaved ice dessert",
  "Egg Tart Café":        "egg tart portuguese bakery cafe",
  "Sports Bar":           "sports bar live game screening",
  "Sky Bar":              "sky bar rooftop cocktails",
  "Rooftop Bar":          "rooftop bar outdoor terrace cocktails",
  "Self Photo Studio":    "self photo studio booth rental",
};

// Restricts the vibe context query to the most relevant place category
const VIBE_TYPE: Record<string, string> = {
  Adventurous: "park",
  Cultural:    "tourist_attraction",
  Foodie:      "restaurant",
  Nightlife:   "bar",
};

// When no interests are selected, fire these preset interests per vibe
// so results are always relevant and varied (replaces the old 2-query generic approach)
const VIBE_INTERESTS: Record<string, string[]> = {
  Adventurous: [
    "Mountain Hiking", "Rock Climbing", "Escape Room", "Kayaking",
    "Laser Tag", "Bouldering", "Trail Running", "Archery", "Go-Kart Racing",
  ],
  Cultural: [
    "Art Gallery", "Museum", "Temple Visit", "Tea Ceremony",
    "History Walk", "Design Museum", "Photography Exhibition", "Architecture Walk", "Classical Concert",
  ],
  Foodie: [
    "Omakase", "Night Market", "Fine Dining", "Ramen", "Dim Sum",
    "Craft Beer", "Specialty Coffee", "Korean BBQ", "Street Food",
  ],
  Nightlife: [
    "Cocktail Bar", "Jazz Club", "Karaoke", "Live Music",
    "Night Market Crawl", "Listening Bar", "Whisky Bar", "Rooftop Bar", "Comedy Show",
  ],
  Casual: [
    "Specialty Coffee", "Book Café", "Board Games", "Brunch",
    "Bubble Tea", "Cat Café", "Afternoon Tea", "Bookstore", "Garden Café",
  ],
  Romantic: [
    "Rooftop Dining", "Wine Bar", "Couples Massage", "Sunset Watching",
    "Omakase", "Champagne Bar", "Flower Arranging", "Dessert Omakase", "Botanical Garden",
  ],
};

interface NewPlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  priceLevel?: string;
  photos?: { name: string }[];
  googleMapsUri?: string;
  websiteUri?: string;
}

// Only restaurants, bars, and cafes reliably have price level data in Google Places
const PRICE_LEVEL_TYPES = new Set(["restaurant", "bar", "cafe", "bakery"]);

async function searchText(
  query: string,
  lat: number,
  lng: number,
  priceLevels: string[],
  includedType?: string,
  radius = 12000,
): Promise<NewPlace[]> {
  const applyPriceLevels = priceLevels.length > 0 && (!includedType || PRICE_LEVEL_TYPES.has(includedType));
  const body: Record<string, unknown> = {
    textQuery: query,
    maxResultCount: 20,
    locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } },
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
          "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.photos,places.googleMapsUri,places.websiteUri",
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

  const scoreMap = new Map<string, number>();
  const placeMap = new Map<string, NewPlace>();

  function ingest(p: NewPlace, score: number) {
    if (!p.id || !p.displayName?.text) return;
    placeMap.set(p.id, p);
    scoreMap.set(p.id, Math.max(scoreMap.get(p.id) ?? 0, score));
  }

  if (interestList.length > 0) {
    const capped = interestList.slice(0, 15);

    // Pass 1: specific query per interest
    const interestQueries = capped.map((i) => ({
      interest: i,
      query: `${SEARCH_QUERY[i] ?? i} ${loc}`,
      type:  INTEREST_TYPE[i],
    }));
    const sets = await Promise.all(
      interestQueries.map(({ query, type }) =>
        searchText(query, coords.lat, coords.lng, priceLevels, type)
      )
    );
    sets.forEach((set) => set.forEach((p) => ingest(p, 1)));

    // Pass 2: retry any interest that returned 0 results with a simpler query,
    // no type restriction, and wider radius so niche/sparse venues can still be found
    const emptyInterests = capped.filter((_, idx) => sets[idx].length === 0);
    if (emptyInterests.length > 0) {
      const retries = await Promise.all(
        emptyInterests.map((i) =>
          searchText(`${i} Taipei Taiwan`, coords.lat, coords.lng, [], undefined, 25000)
        )
      );
      retries.forEach((set) => set.forEach((p) => ingest(p, 1)));
    }
  } else {
    // Vibe mode: fire preset interests for this vibe — gives far more relevant results
    // than the old 2-query generic approach
    const presets = VIBE_INTERESTS[vibe] ?? [];
    const vibeQueries = presets.map((i) => ({
      query: `${SEARCH_QUERY[i] ?? i} ${loc}`,
      type:  INTEREST_TYPE[i],
    }));
    const sets = await Promise.all(
      vibeQueries.map(({ query, type }) =>
        searchText(query, coords.lat, coords.lng, priceLevels, type)
      )
    );
    sets.forEach((set) => set.forEach((p) => ingest(p, 0)));

    if (placeMap.size < 6) {
      const fallback = await searchText(`${vibe} ${loc}`, coords.lat, coords.lng, [], VIBE_TYPE[vibe]);
      fallback.forEach((p) => ingest(p, 0));
    }
  }

  if (placeMap.size === 0) return NextResponse.json({ venues: [], relevantCount: 0 });

  // Sort by rating when all scores are equal (interest mode), or score→rating (vibe mode)
  const sorted = [...placeMap.values()].sort((a, b) => {
    const sa = scoreMap.get(a.id) ?? 0;
    const sb = scoreMap.get(b.id) ?? 0;
    if (sb !== sa) return sb - sa;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });

  const relevantCount = sorted.length;

  const venues = sorted.map((p) => ({
    place_id:    p.id,
    name:        p.displayName!.text,
    address:     p.formattedAddress ?? "",
    rating:      p.rating,
    price_level: p.priceLevel ? PRICE_LEVEL_MAP[p.priceLevel] ?? 2 : 2,
    photo:       p.photos?.[0]?.name ? getPhotoUrl(p.photos[0].name) : null,
    maps_link:   p.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${p.id}`,
    website:     p.websiteUri ?? null,
  }));

  return NextResponse.json({ venues, relevantCount });
}

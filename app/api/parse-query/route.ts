import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM = `Extract date search parameters from a natural language query for Taipei. Return ONLY a valid JSON object with these exact keys:
{
  "neighbourhood": one of "All Taipei"|"Da-an"|"Xinyi"|"Zhongshan"|"Shilin"|"Beitou"|"Songshan"|"Wanhua"|"Neihu"|"Tamsui",
  "budget": one of "$ Budget (NT$0-300)"|"$$ Medium (NT$300-800)"|"$$$ Upscale (NT$800-2000)"|"$$$$ Luxury (NT$2000+)",
  "vibe": one of "Casual"|"Romantic"|"Adventurous"|"Foodie"|"Cultural"|"Nightlife",
  "timeOfDay": one of "Any time"|"Morning"|"Afternoon"|"Evening"|"Late night",
  "interests": array of 1-4 strings chosen from: Night Market, Hotpot, Bubble Tea, Brunch, Ramen, Dim Sum, Beef Noodle Soup, Omakase, Korean BBQ, Izakaya, Fine Dining, Michelin Dining, Rooftop Dining, Cocktail Bar, Wine Bar, Whisky Bar, Craft Beer, Specialty Coffee, Matcha Café, Cat Café, Afternoon Tea, Dessert Bar, Art Gallery, Museum, Jazz Club, Live Music, Rock Concert, Film, Comedy Show, Karaoke, Escape Room, Board Games, Arcade, Bowling, Mini Golf, Pottery Class, Painting Workshop, Cooking Class, Candle Making, Flower Arranging, Dance Class, Film Photography, Mountain Hiking, Elephant Mountain, Cycling Tour, Kayaking, Picnic, Hot Springs, Stargazing, Sunset Watching, Botanical Garden, Zoo Date, Aquarium Visit, Spa & Wellness, Couples Massage, Foot Massage, Yoga, Nail Art, Tarot Reading, Bookstore, Self Photo Studio
}
Defaults when not specified: neighbourhood="All Taipei", budget="$$ Medium (NT$300-800)", vibe="Casual", timeOfDay="Any time", interests=[].
Vibe mapping: romantic/intimate/anniversary → Romantic, fun/exciting/active → Adventurous, food/eat/hungry → Foodie, artsy/museum/culture → Cultural, party/drinks/night → Nightlife, chill/relax/coffee → Casual.
Return JSON only. No markdown, no explanation.`;

export async function POST(req: Request) {
  const { query } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 256,
    system: SYSTEM,
    messages: [{ role: "user", content: query }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const params = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    return Response.json(params);
  } catch {
    return Response.json({
      neighbourhood: "All Taipei", budget: "$$ Medium (NT$300-800)",
      vibe: "Casual", timeOfDay: "Any time", interests: [],
    });
  }
}

export interface Venue {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  price_level?: number;
  photo?: string;
  maps_link: string;
  website?: string | null;
  tip?: string;
}

export type ApiMessage = { role: "user" | "assistant"; content: string };

export type ConvState = {
  question: string;
  options: string[];
  messages: ApiMessage[];
};

import type { PlanInput, Place } from "@/lib/types";
import type { StaysProvider, PlacesProvider, SocialProvider } from "./types";

function seededNumber(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function mk(kind: Place["source"], names: string[], seed: number, count: number, tag: string): Place[] {
  return Array.from({ length: count }).map((_, i) => ({
    name: names[(seed + i * 7) % names.length],
    source: kind,
    rating: Math.round((4 + (((seed + i) % 10) / 20)) * 10) / 10,
    notes: tag,
    tags: [tag],
  }));
}

export const mockStays: StaysProvider = async (input, seed) => {
  const s = seededNumber(seed);
  const stayNames = [
    `${input.location} Studio Loft`,
    `${input.location} City Apartment`,
    `${input.location} Minimal Hotel`,
    `${input.location} Boutique Stay`,
    `${input.location} Riverside Room`,
    `${input.location} Modern Micro-suite`,
  ];
  return mk("booking", stayNames, s, 3, "stay");
};

export const mockPlaces: PlacesProvider = async (_input, seed) => {
  const s = seededNumber(seed);
  const gymNames = ["Iron District Gym","Prime Barbell Club","Functional Factory","City Strength Lab","Atlas Fitness","Pulse Training Room"];
  const coworkNames = ["Grid Cowork","Mono Workspace","Studio Deskhouse","Concrete & Coffee","Paperplane Cowork","Linework Office"];
  return {
    gyms: mk("google", gymNames, s + 11, 3, "gym"),
    coworks: mk("google", coworkNames, s + 23, 3, "cowork"),
  };
};

export const mockSocial: SocialProvider = async (_input, seed) => {
  const s = seededNumber(seed);
  const socialNames = ["Language exchange night","Board game meetup","Tech founder meetup","Salsa social","Rooftop bar (early hours)","Live jazz / indie show","Running club"];
  return mk("reddit", socialNames, s + 37, 5, "social");
};

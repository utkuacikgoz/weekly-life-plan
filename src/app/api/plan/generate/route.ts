import { NextResponse } from "next/server";
import type { PlanInput, PlanOutput, Place } from "@/lib/types";

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

function seededNumber(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function mkPlaces(kind: Place["source"], baseNames: string[], seed: number, count: number, tag: string): Place[] {
  return Array.from({ length: count }).map((_, i) => {
    const name = baseNames[(seed + i * 7) % baseNames.length];
    const rating = 4 + (((seed + i) % 10) / 20); // 4.0 - 4.45
    return {
      name,
      source: kind,
      rating: Math.round(rating * 10) / 10,
      notes: tag,
      tags: [tag],
      url: undefined,
    };
  });
}

function computeBudget(input: PlanInput, nights: number) {
  const weeks = input.weeks;
  const days = weeks * 7;

  // Simple assumptions (editable later)
  const foodPerDay = input.currency === "THB" ? 700 : 25;
  const transportPerDay = input.currency === "THB" ? 200 : 6;
  const coworkPerDay = input.currency === "THB" ? 350 : 10;
  const gymPerWeek = input.currency === "THB" ? 700 : 12;
  const bufferPct = 10;

  // Lodging heuristic: allocate ~45% of budget to lodging if unknown
  const lodging = Math.round(input.budget * 0.45);
  const food = Math.round(foodPerDay * days);
  const transport = Math.round(transportPerDay * days);
  const cowork = Math.round(coworkPerDay * (days - 2)); // assume 5 days/week
  const gym = Math.round(gymPerWeek * weeks);
  const subtotal = lodging + food + transport + cowork + gym;
  const buffer = Math.round(subtotal * (bufferPct / 100));
  const total = subtotal + buffer;

  const warnings: string[] = [];
  if (total > input.budget) warnings.push("Your plan exceeds the stated budget under default assumptions.");

  return {
    currency: input.currency,
    weeks,
    lodging,
    food,
    transport,
    cowork,
    gym,
    buffer,
    total,
    assumptions: { foodPerDay, transportPerDay, coworkPerDay, gymPerWeek, bufferPct },
    warnings,
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as { input: PlanInput; seed?: string };

  const input = body.input;
  const seed = body.seed ?? `${input.location}-${input.weeks}-${input.budget}-${Date.now()}`;
  const s = seededNumber(seed);

  const areas = ["Central", "Riverside", "Old Town", "Business District", "Creative Quarter", "Midtown"];
  const homeBaseArea = pick(areas, s);

  const stayNames = [
    `${input.location} Studio Loft`,
    `${input.location} City Apartment`,
    `${input.location} Minimal Hotel`,
    `${input.location} Boutique Stay`,
    `${input.location} Riverside Room`,
    `${input.location} Modern Micro-suite`,
  ];
  const gymNames = [
    "Iron District Gym",
    "Prime Barbell Club",
    "Functional Factory",
    "City Strength Lab",
    "Atlas Fitness",
    "Pulse Training Room",
  ];
  const coworkNames = [
    "Grid Cowork",
    "Mono Workspace",
    "Studio Deskhouse",
    "Concrete & Coffee",
    "Paperplane Cowork",
    "Linework Office",
  ];
  const socialNames = [
    "Language exchange night",
    "Board game meetup",
    "Tech founder meetup",
    "Salsa social",
    "Rooftop bar (early hours)",
    "Live jazz / indie show",
    "Running club",
  ];

  const nights = input.weeks * 7 - 1;

  const output: PlanOutput = {
    summary: {
      homeBaseArea,
      why: [
        "Short commutes to cowork + gym",
        "High density of food options",
        "Easy social entry points (events/meetups)",
      ],
    },
    stays: mkPlaces("booking", stayNames, s, 3, "stay"),
    gyms: mkPlaces("google", gymNames, s + 11, 3, "gym"),
    coworks: mkPlaces("google", coworkNames, s + 23, 3, "cowork"),
    social: mkPlaces("reddit", socialNames, s + 37, 5, "social"),
    schedule: [
      { day: "Mon", blocks: [{ label: "Cowork", start: "09:30", end: "13:00" }, { label: "Gym", start: "17:30", end: "19:00" }] },
      { day: "Tue", blocks: [{ label: "Cowork", start: "10:00", end: "14:00" }, { label: "Social", start: "19:30", end: "22:00" }] },
      { day: "Wed", blocks: [{ label: "Cowork", start: "09:30", end: "13:00" }, { label: "Gym", start: "17:30", end: "19:00" }] },
      { day: "Thu", blocks: [{ label: "Cowork", start: "10:00", end: "14:00" }, { label: "Social", start: "19:30", end: "22:00" }] },
      { day: "Fri", blocks: [{ label: "Cowork", start: "09:30", end: "12:30" }, { label: "Social", start: "20:00", end: "23:00" }] },
      { day: "Sat", blocks: [{ label: "Explore", start: "11:00", end: "16:00" }] },
      { day: "Sun", blocks: [{ label: "Reset", start: "12:00", end: "14:00" }] },
    ],
    budget: computeBudget(input, nights),
    provenance: {
      generatedAt: new Date().toISOString(),
      seed,
      notes: ["MVP generator uses placeholder sources. Replace with real APIs later."],
    },
  };

  return NextResponse.json({ output });
}

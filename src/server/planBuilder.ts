import type { PlanInput, PlanOutput } from "@/lib/types";
import { mockPlaces, mockSocial, mockStays } from "./providers/mock";

function pick<T>(arr: T[], seed: number) { return arr[seed % arr.length]; }
function seededNumber(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

function computeBudget(input: PlanInput) {
  const weeks = input.weeks;
  const days = weeks * 7;
  const foodPerDay = input.currency === "THB" ? 700 : 25;
  const transportPerDay = input.currency === "THB" ? 200 : 6;
  const coworkPerDay = input.currency === "THB" ? 350 : 10;
  const gymPerWeek = input.currency === "THB" ? 700 : 12;
  const bufferPct = 10;

  const lodging = Math.round(input.budget * 0.45);
  const food = Math.round(foodPerDay * days);
  const transport = Math.round(transportPerDay * days);
  const cowork = Math.round(coworkPerDay * (days - 2));
  const gym = Math.round(gymPerWeek * weeks);
  const subtotal = lodging + food + transport + cowork + gym;
  const buffer = Math.round(subtotal * (bufferPct / 100));
  const total = subtotal + buffer;

  const warnings: string[] = [];
  if (total > input.budget) warnings.push("Your plan exceeds the stated budget under default assumptions.");

  return {
    currency: input.currency,
    weeks,
    lodging, food, transport, cowork, gym, buffer, total,
    assumptions: { foodPerDay, transportPerDay, coworkPerDay, gymPerWeek, bufferPct },
    warnings,
  };
}

export async function buildPlanOutput(input: PlanInput, seed: string): Promise<PlanOutput> {
  const s = seededNumber(seed);
  const areas = ["Central", "Riverside", "Old Town", "Business District", "Creative Quarter", "Midtown"];
  const homeBaseArea = pick(areas, s);

  const [stays, places, social] = await Promise.all([
    mockStays(input, seed),
    mockPlaces(input, seed),
    mockSocial(input, seed),
  ]);

  return {
    summary: {
      homeBaseArea,
      why: ["Short commutes to cowork + gym", "High density of food options", "Easy social entry points (events/meetups)"],
    },
    stays,
    gyms: places.gyms,
    coworks: places.coworks,
    social,
    schedule: [
      { day: "Mon", blocks: [{ label: "Cowork", start: "09:30", end: "13:00" }, { label: "Gym", start: "17:30", end: "19:00" }] },
      { day: "Tue", blocks: [{ label: "Cowork", start: "10:00", end: "14:00" }, { label: "Social", start: "19:30", end: "22:00" }] },
      { day: "Wed", blocks: [{ label: "Cowork", start: "09:30", end: "13:00" }, { label: "Gym", start: "17:30", end: "19:00" }] },
      { day: "Thu", blocks: [{ label: "Cowork", start: "10:00", end: "14:00" }, { label: "Social", start: "19:30", end: "22:00" }] },
      { day: "Fri", blocks: [{ label: "Cowork", start: "09:30", end: "12:30" }, { label: "Social", start: "20:00", end: "23:00" }] },
      { day: "Sat", blocks: [{ label: "Explore", start: "11:00", end: "16:00" }] },
      { day: "Sun", blocks: [{ label: "Reset", start: "12:00", end: "14:00" }] },
    ],
    budget: computeBudget(input),
    provenance: {
      generatedAt: new Date().toISOString(),
      seed,
      notes: ["MVP uses mock providers. Plug real APIs later without changing UI."],
    },
  };
}

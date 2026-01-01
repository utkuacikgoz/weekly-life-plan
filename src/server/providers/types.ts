import type { PlanInput, Place } from "@/lib/types";

export type StaysProvider = (input: PlanInput, seed: string) => Promise<Place[]>;
export type PlacesProvider = (input: PlanInput, seed: string) => Promise<{ gyms: Place[]; coworks: Place[] }>;
export type SocialProvider = (input: PlanInput, seed: string) => Promise<Place[]>;

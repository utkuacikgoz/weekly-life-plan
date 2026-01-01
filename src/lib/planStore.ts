"use client";

import type { PlanArtifact, PlanInput, PlanOutput } from "./types";

const KEY = "wlp_plans_v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function createId(): string {
  // short, URL-safe-ish id
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

export function loadAllPlans(): Record<string, PlanArtifact> {
  return safeParse<Record<string, PlanArtifact>>(localStorage.getItem(KEY)) ?? {};
}

export function saveAllPlans(map: Record<string, PlanArtifact>) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getPlan(id: string): PlanArtifact | null {
  const map = loadAllPlans();
  return map[id] ?? null;
}

export function upsertPlan(plan: PlanArtifact) {
  const map = loadAllPlans();
  map[plan.id] = plan;
  saveAllPlans(map);
}

export function createPlan(input: PlanInput, output: PlanOutput): PlanArtifact {
  const id = createId();
  const title = `${input.location} — ${input.weeks}w — ${input.currency} ${input.budget.toLocaleString()}`;
  const plan: PlanArtifact = {
    id,
    title,
    input,
    versions: [
      { version: 1, createdAt: new Date().toISOString(), output }
    ],
  };
  upsertPlan(plan);
  return plan;
}

export function addVersion(planId: string, output: PlanOutput): PlanArtifact | null {
  const existing = getPlan(planId);
  if (!existing) return null;

  const nextVersion = (existing.versions[existing.versions.length - 1]?.version ?? 0) + 1;
  const updated: PlanArtifact = {
    ...existing,
    versions: [
      ...existing.versions,
      { version: nextVersion, createdAt: new Date().toISOString(), output },
    ],
  };
  upsertPlan(updated);
  return updated;
}

export function listPlans(): PlanArtifact[] {
  const map = loadAllPlans();
  return Object.values(map).sort((a, b) => b.versions.length - a.versions.length);
}

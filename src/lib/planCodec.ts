import type { PlanArtifact } from "./types";

export function encodePlanForUrl(plan: PlanArtifact): string {
  const json = JSON.stringify(plan);
  // base64url
  const b64 = Buffer.from(json, "utf8").toString("base64");
  return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function decodePlanFromUrl(payload: string): PlanArtifact {
  const padded = payload.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((payload.length + 3) % 4);
  const json = Buffer.from(padded, "base64").toString("utf8");
  return JSON.parse(json) as PlanArtifact;
}

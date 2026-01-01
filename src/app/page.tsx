"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanInput, PlanOutput, Weeks } from "@/lib/types";
import { Container, Header, Card, TinyLabel, Input, Select, Button } from "@/components/Bauhaus";
import { createPlan, listPlans } from "@/lib/planStore";

async function generatePlan(input: PlanInput): Promise<PlanOutput> {
  const res = await fetch("/api/plan/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) throw new Error("Failed to generate plan");
  const data = (await res.json()) as { output: PlanOutput };
  return data.output;
}

export default function Page() {
  const router = useRouter();

  const [weeks, setWeeks] = useState<Weeks>(1);
  const [location, setLocation] = useState("Bangkok");
  const [budget, setBudget] = useState(1200);
  const [currency, setCurrency] = useState<PlanInput["currency"]>("USD");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recent = useMemo(() => {
    try { return listPlans().slice(0, 5); } catch { return []; }
  }, []);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const input: PlanInput = { weeks, location: location.trim(), budget: Number(budget), currency };
      const output = await generatePlan(input);
      const plan = createPlan(input, output);
      router.push(`/plan/${plan.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Something broke");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Header />

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Create">
          <div className="space-y-5">
            <div>
              <TinyLabel>Weeks</TinyLabel>
              <Select value={weeks} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWeeks(Number(e.target.value) as Weeks)}>
                <option value={1}>1 week</option>
                <option value={2}>2 weeks</option>
                <option value={3}>3 weeks</option>
                <option value={4}>4 weeks</option>
              </Select>
            </div>

            <div>
              <TinyLabel>Location</TinyLabel>
              <Input value={location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} placeholder="City" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <TinyLabel>Budget</TinyLabel>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudget(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div>
                <TinyLabel>Currency</TinyLabel>
                <Select value={currency} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value as any)}>
                  <option value="USD">USD</option>
                  <option value="THB">THB</option>
                  <option value="EUR">EUR</option>
                </Select>
              </div>
            </div>

            {error ? <div className="text-sm text-red-600">{error}</div> : null}

            <Button onClick={onSubmit} disabled={loading || !location.trim()}>
              {loading ? "Generating…" : "Generate plan (free)"}
            </Button>

            <div className="text-xs text-neutral-600">
              Current generator is placeholder. Real sources (Booking/Places/Reddit) come later.
            </div>
          </div>
        </Card>

        <Card title="Recent (local)">
          {recent.length === 0 ? (
            <div className="text-sm text-neutral-600">No saved plans yet.</div>
          ) : (
            <ul className="space-y-3">
              {recent.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                  <div>
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="text-xs text-neutral-600">
                      versions: {p.versions.length}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => router.push(`/plan/${p.id}`)}>
                    Open
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Container>
  );
}

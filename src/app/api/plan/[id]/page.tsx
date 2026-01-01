"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { PlanArtifact, PlanOutput } from "@/lib/types";
import { addVersion, getPlan } from "@/lib/planStore";
import { encodePlanForUrl } from "@/lib/planCodec";
import { Container, Header, Card, Button } from "@/components/Bauhaus";

async function rerun(input: any): Promise<PlanOutput> {
  const res = await fetch("/api/plan/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, seed: `${Date.now()}` }),
  });
  if (!res.ok) throw new Error("Failed to rerun");
  const data = (await res.json()) as { output: PlanOutput };
  return data.output;
}

function money(n: number, c: string) {
  return `${c} ${Math.round(n).toLocaleString()}`;
}

export default function PlanPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [plan, setPlan] = useState<PlanArtifact | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = getPlan(id);
    setPlan(p);
  }, [id]);

  const latest = useMemo(() => {
    if (!plan) return null;
    return plan.versions[plan.versions.length - 1] ?? null;
  }, [plan]);

  async function onRerun() {
    if (!plan) return;
    setLoading(true);
    try {
      const out = await rerun(plan.input);
      const updated = addVersion(plan.id, out);
      setPlan(updated);
    } finally {
      setLoading(false);
    }
  }

  async function onShare() {
    if (!plan) return;
    const payload = encodePlanForUrl(plan);
    const url = `${window.location.origin}/s/${payload}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied.");
  }

  if (!plan || !latest) {
    return (
      <Container>
        <Header />
        <Card title="Not found">
          <div className="text-sm text-neutral-600">
            This plan isn’t in local storage on this device.
          </div>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => router.push("/")}>Back</Button>
          </div>
        </Card>
      </Container>
    );
  }

  const out = latest.output;

  return (
    <Container>
      <Header />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button onClick={onRerun} disabled={loading}>
          {loading ? "Re-running…" : "Re-run (new version)"}
        </Button>
        <Button variant="ghost" onClick={onShare}>Share</Button>
        <Button variant="ghost" onClick={() => router.push("/")}>New</Button>

        <div className="ml-auto text-xs text-neutral-600">
          v{latest.version} • {new Date(latest.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Summary">
          <div className="text-sm">
            <div className="font-semibold">Home base</div>
            <div className="mt-1">{out.summary.homeBaseArea}</div>

            <div className="mt-4 font-semibold">Why</div>
            <ul className="mt-2 list-disc pl-5 text-neutral-700">
              {out.summary.why.map((x: string, i: number) => <li key={i}>{x}</li>)}
            </ul>
          </div>
        </Card>

        <Card title="Budget">
          <div className="text-sm space-y-2">
            <Row label="Lodging" value={money(out.budget.lodging, out.budget.currency)} />
            <Row label="Food" value={money(out.budget.food, out.budget.currency)} />
            <Row label="Transport" value={money(out.budget.transport, out.budget.currency)} />
            <Row label="Cowork" value={money(out.budget.cowork, out.budget.currency)} />
            <Row label="Gym" value={money(out.budget.gym, out.budget.currency)} />
            <Row label="Buffer" value={money(out.budget.buffer, out.budget.currency)} />
            <div className="mt-3 border-t border-neutral-200 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>{money(out.budget.total, out.budget.currency)}</span>
            </div>

            {out.budget.warnings.length ? (
              <div className="mt-3 text-xs text-red-600">
                {out.budget.warnings.join(" ")}
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="Stay (3)">
          <PlaceList items={out.stays} />
        </Card>

        <Card title="Gym (3)">
          <PlaceList items={out.gyms} />
        </Card>

        <Card title="Cowork (3)">
          <PlaceList items={out.coworks} />
        </Card>

        <Card title="Social (menu)">
          <PlaceList items={out.social} />
        </Card>

        <Card title="Schedule skeleton">
          <div className="space-y-3 text-sm">
            {out.schedule.map((d: any) => (
              <div key={d.day} className="border-b border-neutral-200 pb-2">
                <div className="font-semibold">{d.day}</div>
                <div className="mt-1 space-y-1 text-neutral-700">
                  {d.blocks.map((b: any, i: number) => (
                    <div key={i} className="flex justify-between gap-3">
                      <span>{b.label}</span>
                      <span className="text-neutral-600">{b.start}–{b.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Versions">
          <ul className="text-sm space-y-2">
            {plan.versions.slice().reverse().map((v: any) => (
              <li key={v.version} className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-semibold">v{v.version}</span>
                <span className="text-xs text-neutral-600">{new Date(v.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-neutral-700">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function PlaceList({ items }: { items: any[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {items.map((p, i) => (
        <li key={i} className="border-b border-neutral-200 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">{p.name}</div>
            {p.rating ? <div className="text-xs text-neutral-600">{p.rating}★</div> : null}
          </div>
          <div className="mt-1 text-xs text-neutral-600">
            {p.source}{p.notes ? ` • ${p.notes}` : ""}
          </div>
        </li>
      ))}
    </ul>
  );
}

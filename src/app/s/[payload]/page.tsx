import { decodePlanFromUrl } from "@/lib/planCodec";
import { Container, Header, Card } from "@/components/Bauhaus";

export default function SharedPlanPage({ params }: { params: { payload: string } }) {
  const plan = decodePlanFromUrl(params.payload);
  const latest = plan.versions[plan.versions.length - 1];

  return (
    <Container>
      <Header />

      <Card title="Shared plan">
        <div className="text-sm">
          <div className="font-semibold">{plan.title}</div>
          <div className="mt-2 text-neutral-700">
            Home base: <span className="font-semibold">{latest.output.summary.homeBaseArea}</span>
          </div>
          <div className="mt-4">
            <div className="font-semibold">Budget total</div>
            <div className="mt-1">
              {latest.output.budget.currency} {Math.round(latest.output.budget.total).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card title="Stay (3)"><SimpleList items={latest.output.stays.map((s: any) => s.name)} /></Card>
        <Card title="Gym (3)"><SimpleList items={latest.output.gyms.map((s: any) => s.name)} /></Card>
        <Card title="Cowork (3)"><SimpleList items={latest.output.coworks.map((s: any) => s.name)} /></Card>
        <Card title="Social"><SimpleList items={latest.output.social.map((s: any) => s.name)} /></Card>
      </div>
    </Container>
  );
}

function SimpleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((x, i) => (
        <li key={i} className="border-b border-neutral-200 pb-2">{x}</li>
      ))}
    </ul>
  );
}

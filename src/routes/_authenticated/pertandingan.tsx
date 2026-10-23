import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { demoMatches } from "@/lib/demo-data";
import { advanceMatch, computeStandings, fmtDateTime, matchStateLabel, type MatchState } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { DevDataNotice, PageHeader, Panel, Section, StatusBadge } from "@/components/kit";
import { Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pertandingan")({
  head: () => ({ meta: [{ title: "Pertandingan — BOLAID" }, { name: "description", content: "Operasional pertandingan dan hasil resmi." }] }),
  component: Page,
});

const tone: Record<MatchState, "neutral" | "info" | "live" | "warning" | "success"> = {
  scheduled: "neutral", ready: "info", live: "live", awaiting: "warning", finalized: "success",
};
const actionLabel: Partial<Record<MatchState, string>> = {
  scheduled: "Konfirmasi siap", ready: "Mulai laga", live: "Ajukan finalisasi", awaiting: "Sahkan hasil resmi",
};

function Page() {
  const [matches, setMatches] = useState(demoMatches);
  const standings = computeStandings(matches);
  const update = (id: string, fn: (m: (typeof matches)[number]) => (typeof matches)[number]) =>
    setMatches((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));
  return (
    <>
      <PageHeader title="Pusat pertandingan" subtitle="Piala Liga Bocah Nusantara 2026 · U-12" />
      <DevDataNotice>status laga hanya tersimpan di layar ini (belum ke database).</DevDataNotice>
      <div className="space-y-3">
        {matches.map((m) => (
          <Panel key={m.id}>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{fmtDateTime(m.time)} · {m.venue}</span>
              <StatusBadge tone={tone[m.state]}>{matchStateLabel[m.state]}</StatusBadge>
            </div>
            {([["home", "homeGoals"], ["away", "awayGoals"]] as const).map(([side, g]) => (
              <div key={side} className="flex items-center gap-2 py-1">
                <span className="flex-1 truncate font-semibold">{m[side]}</span>
                {m.state === "live" && (
                  <Button size="icon" variant="outline" className="size-9" aria-label="Kurangi gol" onClick={() => update(m.id, (x) => ({ ...x, [g]: Math.max(0, x[g] - 1) }))}><Minus className="size-4" /></Button>
                )}
                <span className="w-8 text-center font-display text-2xl font-bold">{m.state === "scheduled" || m.state === "ready" ? "–" : m[g]}</span>
                {m.state === "live" && (
                  <Button size="icon" variant="outline" className="size-9" aria-label="Tambah gol" onClick={() => update(m.id, (x) => ({ ...x, [g]: x[g] + 1 }))}><Plus className="size-4" /></Button>
                )}
              </div>
            ))}
            {actionLabel[m.state] && (
              <Button className="mt-3 h-11 w-full" variant={m.state === "awaiting" ? "default" : "outline"} onClick={() => {
                if (m.state === "awaiting" && !confirm("Sahkan sebagai hasil resmi? Koreksi setelah ini memerlukan alur koreksi resmi.")) return;
                update(m.id, (x) => ({ ...x, state: advanceMatch(x.state) }));
                if (m.state === "awaiting") toast.success("Hasil resmi dipublikasikan. Klasemen diperbarui.");
              }}>{actionLabel[m.state]}</Button>
            )}
          </Panel>
        ))}
      </div>
      <Section title="Klasemen (dari hasil resmi)">
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground"><tr><th className="px-3 py-2 text-left">Tim</th><th>M</th><th>SG</th><th className="px-3">Poin</th></tr></thead>
            <tbody>
              {standings.map((s) => (
                <tr key={s.team} className="border-t">
                  <td className="max-w-[10rem] truncate px-3 py-2 font-medium">{s.team}</td>
                  <td className="text-center">{s.p}</td>
                  <td className="text-center">{s.gf - s.ga}</td>
                  <td className="px-3 text-center font-display font-bold">{s.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Section>
    </>
  );
}

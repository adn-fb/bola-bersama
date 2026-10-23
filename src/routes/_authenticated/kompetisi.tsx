import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { demoApplications, demoCompetitions } from "@/lib/demo-data";
import { fmtDate } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { DevDataNotice, PageHeader, Panel, Section, StatusBadge } from "@/components/kit";
import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/kompetisi")({
  head: () => ({ meta: [{ title: "Kompetisi — BOLAID" }, { name: "description", content: "Penemuan dan pengelolaan kompetisi." }] }),
  component: Page,
});

function Page() {
  const { active } = useApp();
  const role = active?.role;
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <PageHeader title="Kompetisi" subtitle={role === "ssb_admin" ? "Temukan turnamen untuk tim Anda." : role === "association" ? "Pengawasan kompetisi dalam lingkup Anda." : "Kompetisi yang Anda kelola."} />
      <DevDataNotice>pendaftaran kompetisi dan validasi roster dibangun di Fase 3.</DevDataNotice>
      <div className="space-y-3">
        {demoCompetitions.map((c) => (
          <Panel key={c.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.organizer}</p>
              </div>
              <StatusBadge tone="info">{c.category}</StatusBadge>
            </div>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5"><MapPin className="size-3.5" />{c.venue}</p>
              <p className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Batas daftar {fmtDate(c.deadline)} · usia dihitung per {fmtDate(c.referenceDate)}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge tone={c.status.startsWith("Pendaftaran") ? "success" : "warning"}>{c.status}</StatusBadge>
              {role !== "ssb_admin" && <StatusBadge tone="neutral">{c.approval}</StatusBadge>}
            </div>
            {open === c.id && (
              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                <p className="mb-1 font-semibold">Persyaratan</p>
                {c.requirements.map((r) => <p key={r} className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-primary" />{r}</p>)}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(open === c.id ? null : c.id)}>{open === c.id ? "Tutup" : "Persyaratan"}</Button>
              {role === "ssb_admin" && <Button size="sm" onClick={() => toast.info("Pendaftaran tim ke kompetisi tersedia di Fase 3.")}>Daftarkan tim</Button>}
            </div>
          </Panel>
        ))}
      </div>
      {role === "organizer" && (
        <Section title="Aplikasi peserta">
          <Panel className="p-0">
            {demoApplications.map((a) => (
              <div key={a.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{a.team}</p><p className="text-xs text-muted-foreground">{a.players} pemain · {a.issues ? `${a.issues} masalah kelayakan` : "lengkap"}</p></div>
                <StatusBadge tone={a.status === "Disetujui" ? "success" : a.issues ? "danger" : "warning"}>{a.status}</StatusBadge>
              </div>
            ))}
          </Panel>
          <p className="mt-2 text-xs text-muted-foreground">Penyelenggara hanya melihat nama, tanggal lahir, dan status kelayakan pemain — bukan data kontak keluarga.</p>
        </Section>
      )}
    </>
  );
}

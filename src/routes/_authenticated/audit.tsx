import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAudit } from "@/lib/api";
import { fmtDateTime } from "@/lib/domain";
import { Empty, ErrorBox, LoadingList, PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Audit Log — BOLAID" }, { name: "description", content: "Riwayat perubahan dan keputusan." }] }),
  component: Page,
});

const actionLabel: Record<string, string> = {
  create_child: "Profil anak dibuat",
  request_enrollment: "Pendaftaran SSB diajukan",
  decide_enrollment: "Keputusan pendaftaran",
  create_team: "Tim dibuat",
  assign_coach: "Pelatih ditugaskan",
  create_training: "Sesi latihan dibuat",
  submit_verification: "Verifikasi diajukan",
  decide_verification: "Keputusan verifikasi",
  dev_claim_role: "Peran demo diklaim",
};

function Page() {
  const q = useQuery({ queryKey: ["audit"], queryFn: fetchAudit });
  return (
    <>
      <PageHeader title="Riwayat aktivitas" subtitle="Hanya catatan dalam kewenangan Anda yang ditampilkan." />
      {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !q.data?.length ? <Empty title="Belum ada aktivitas" /> : (
        <Panel className="p-0">
          {q.data.map((a) => {
            const d = a.details as { decision?: string; status?: string; note?: string } | null;
            return (
              <div key={a.id} className="border-b px-4 py-3 last:border-0">
                <p className="font-medium">{actionLabel[a.action] ?? a.action}</p>
                {d && (d.decision || d.status) && <p className="text-xs text-muted-foreground">Hasil: {d.decision ?? d.status}{d.note ? ` · “${d.note}”` : ""}</p>}
                <p className="text-xs text-muted-foreground">{fmtDateTime(a.created_at)}</p>
              </div>
            );
          })}
        </Panel>
      )}
    </>
  );
}

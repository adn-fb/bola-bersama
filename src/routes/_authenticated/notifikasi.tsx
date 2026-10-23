import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markAllRead } from "@/lib/api";
import { fmtDateTime } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Empty, ErrorBox, LoadingList, PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/notifikasi")({
  head: () => ({ meta: [{ title: "Notifikasi — BOLAID" }, { name: "description", content: "Pemberitahuan resmi untuk Anda." }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications });
  const m = useMutation({ mutationFn: markAllRead, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const unread = q.data?.some((n) => !n.read);
  return (
    <>
      <PageHeader title="Notifikasi" action={unread && <Button size="sm" variant="ghost" onClick={() => m.mutate()}>Tandai dibaca</Button>} />
      {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !q.data?.length ? <Empty title="Belum ada notifikasi" /> : (
        <div className="space-y-2">
          {q.data.map((n) => (
            <Panel key={n.id} className={n.read ? "" : "border-primary/40 bg-accent/40"}>
              <div className="flex items-start gap-2">
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                <div className="min-w-0">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{fmtDateTime(n.created_at)}</p>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}

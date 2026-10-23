import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTrainings } from "@/lib/api";
import { Empty, ErrorBox, LoadingList, PageHeader } from "@/components/kit";
import { TrainingCard } from "@/components/homes";

export const Route = createFileRoute("/_authenticated/jadwal")({
  head: () => ({ meta: [{ title: "Jadwal — BOLAID" }, { name: "description", content: "Jadwal latihan dan pertandingan." }] }),
  component: Page,
});

function Page() {
  const q = useQuery({ queryKey: ["trainings"], queryFn: fetchTrainings });
  return (
    <>
      <PageHeader title="Jadwal" subtitle="Latihan tim yang terhubung dengan Anda." />
      {q.isLoading ? <LoadingList /> : q.error ? <ErrorBox error={q.error} /> : !q.data?.length ? (
        <Empty title="Belum ada jadwal" hint="Jadwal muncul setelah pelatih membuat sesi latihan." />
      ) : (
        <div className="space-y-2">{q.data.map((t) => <TrainingCard key={t.id} t={t} />)}</div>
      )}
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { LoadingList } from "@/components/kit";
import { AssociationHome, CoachHome, OnboardingHome, OrganizerHome, ParentHome, PlayerHome, SsbHome } from "@/components/homes";

export const Route = createFileRoute("/_authenticated/beranda")({
  head: () => ({ meta: [{ title: "Beranda — BOLAID" }, { name: "description", content: "Beranda BOLAID sesuai peran Anda." }] }),
  component: Beranda,
});

function Beranda() {
  const { active, loading } = useApp();
  if (loading) return <LoadingList rows={4} />;
  switch (active?.role) {
    case "parent": return <ParentHome />;
    case "player": return <PlayerHome />;
    case "coach": return <CoachHome />;
    case "ssb_admin": return <SsbHome />;
    case "organizer": return <OrganizerHome />;
    case "association": return <AssociationHome />;
    default: return <OnboardingHome />;
  }
}

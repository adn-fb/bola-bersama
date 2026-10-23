import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppContextProvider, useApp } from "@/lib/app-context";
import { roleLabel, type AppRole } from "@/lib/domain";
import { fetchNotifications } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Home, CalendarDays, Baby, Bell, UserRound, Users, ClipboardList, Trophy, Swords, ShieldCheck, History, LogOut,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    return { user: data.user };
  },
  component: Layout,
});

type NavItem = { to: string; label: string; icon: LucideIcon };
const nav: Record<AppRole | "none", NavItem[]> = {
  none: [
    { to: "/beranda", label: "Beranda", icon: Home },
    { to: "/notifikasi", label: "Notifikasi", icon: Bell },
    { to: "/akun", label: "Akun", icon: UserRound },
  ],
  parent: [
    { to: "/beranda", label: "Beranda", icon: Home },
    { to: "/jadwal", label: "Jadwal", icon: CalendarDays },
    { to: "/anak", label: "Anak", icon: Baby },
    { to: "/notifikasi", label: "Notifikasi", icon: Bell },
    { to: "/akun", label: "Akun", icon: UserRound },
  ],
  player: [
    { to: "/beranda", label: "Beranda", icon: Home },
    { to: "/jadwal", label: "Jadwal", icon: CalendarDays },
    { to: "/akun", label: "Akun", icon: UserRound },
  ],
  coach: [
    { to: "/beranda", label: "Beranda", icon: Home },
    { to: "/tim", label: "Tim", icon: Users },
    { to: "/jadwal", label: "Jadwal", icon: CalendarDays },
    { to: "/notifikasi", label: "Notifikasi", icon: Bell },
    { to: "/akun", label: "Akun", icon: UserRound },
  ],
  ssb_admin: [
    { to: "/beranda", label: "Ringkasan", icon: Home },
    { to: "/pendaftaran", label: "Pendaftaran", icon: ClipboardList },
    { to: "/tim", label: "Tim", icon: Users },
    { to: "/kompetisi", label: "Kompetisi", icon: Trophy },
    { to: "/akun", label: "Lainnya", icon: UserRound },
  ],
  organizer: [
    { to: "/beranda", label: "Ringkasan", icon: Home },
    { to: "/kompetisi", label: "Kompetisi", icon: Trophy },
    { to: "/pertandingan", label: "Pertandingan", icon: Swords },
    { to: "/akun", label: "Lainnya", icon: UserRound },
  ],
  association: [
    { to: "/beranda", label: "Ringkasan", icon: Home },
    { to: "/verifikasi", label: "Verifikasi", icon: ShieldCheck },
    { to: "/kompetisi", label: "Kompetisi", icon: Trophy },
    { to: "/audit", label: "Audit", icon: History },
    { to: "/akun", label: "Lainnya", icon: UserRound },
  ],
};

function Layout() {
  const { user } = Route.useRouteContext();
  return (
    <AppContextProvider user={user}>
      <Shell />
    </AppContextProvider>
  );
}

function ContextSwitcher() {
  const { contexts, active, setActive } = useApp();
  if (contexts.length < 2 || !active) return null;
  return (
    <Select value={active.key} onValueChange={setActive}>
      <SelectTrigger className="h-9 max-w-[60vw] border-sidebar-border bg-sidebar-accent text-left text-xs text-sidebar-accent-foreground md:max-w-none" aria-label="Ganti peran">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {contexts.map((c) => (
          <SelectItem key={c.key} value={c.key}>
            {roleLabel[c.role]}{c.orgName ? ` · ${c.orgName}` : ""}{c.playerName ? ` · ${c.playerName} (pratinjau)` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Shell() {
  const { active } = useApp();
  const items = nav[active?.role ?? "none"];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const notif = useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications });
  const unread = notif.data?.filter((n) => !n.read).length ?? 0;
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex md:sticky md:top-0 md:h-screen">
        <Link to="/beranda" className="mb-6 px-2 font-display text-xl font-extrabold">BOLA<span className="text-lime">ID</span></Link>
        <ContextSwitcher />
        <nav className="mt-4 flex-1 space-y-1">
          {items.map((i) => (
            <Link key={i.to} to={i.to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent", path.startsWith(i.to) && "bg-sidebar-accent text-sidebar-primary")}>
              <i.icon className="size-4" /> {i.label}
              {i.to === "/notifikasi" && unread > 0 && <span className="ml-auto rounded-full bg-lime px-1.5 text-xs font-bold text-navy">{unread}</span>}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-sidebar-accent"><LogOut className="size-4" /> Keluar</button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
          <Link to="/beranda" className="font-display text-lg font-extrabold">BOLA<span className="text-lime">ID</span></Link>
          <div className="flex items-center gap-2">
            <ContextSwitcher />
            <Link to="/notifikasi" className="relative p-2" aria-label="Notifikasi">
              <Bell className="size-5" />
              {unread > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-lime" />}
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">
          <Outlet />
        </main>
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-card md:hidden" aria-label="Navigasi utama">
          <div className="mx-auto flex max-w-lg">
            {items.map((i) => {
              const on = path.startsWith(i.to);
              return (
                <Link key={i.to} to={i.to} className={cn("flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold", on ? "text-primary" : "text-muted-foreground")}>
                  <span className={cn("rounded-full px-4 py-1", on && "bg-accent")}><i.icon className="size-5" /></span>
                  {i.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

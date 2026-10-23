// Lapisan akses data. Semua penulisan lewat fungsi database (RPC) yang
// memeriksa kewenangan di server; pembacaan dibatasi Row Level Security.
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./domain";

export async function rpc<T = unknown>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export interface Ctx {
  key: string;
  role: AppRole;
  orgId: string | null;
  orgName: string | null;
  playerId?: string;
  playerName?: string;
}

export async function fetchContexts(): Promise<Ctx[]> {
  const roles = check(
    await supabase.from("user_roles").select("role, organization_id, organizations(name)"),
  );
  const out: Ctx[] = roles.map((r) => ({
    key: `${r.role}:${r.organization_id ?? "-"}`,
    role: r.role as AppRole,
    orgId: r.organization_id,
    orgName: (r.organizations as { name: string } | null)?.name ?? null,
  }));
  if (out.some((c) => c.role === "parent")) {
    const kids = check(await supabase.from("guardian_relationships").select("player_profiles(id, full_name)"));
    for (const k of kids) {
      const p = k.player_profiles as { id: string; full_name: string } | null;
      if (p) out.push({ key: `player:${p.id}`, role: "player", orgId: null, orgName: null, playerId: p.id, playerName: p.full_name });
    }
  }
  return out;
}

export async function fetchChildren() {
  return check(
    await supabase
      .from("guardian_relationships")
      .select(
        "relation, player_profiles(id, full_name, birth_date, position, created_at, enrollment_requests(id, status, decision_note, created_at, decided_at, organizations(name)), team_memberships(id, active, started_at, teams(id, name, age_group, organizations(name))))",
      ),
  );
}

export async function fetchSsbs() {
  return check(await supabase.from("organizations").select("*").eq("kind", "ssb").order("name"));
}
export async function fetchDemoOrgs() {
  return check(await supabase.from("organizations").select("*").eq("is_demo", true).order("kind"));
}
export async function fetchOrgs() {
  return check(await supabase.from("organizations").select("*").order("name"));
}

export async function fetchOrgRequests(orgId: string) {
  return check(
    await supabase
      .from("enrollment_requests")
      .select("*, player_profiles(full_name, birth_date, position)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
  );
}

export async function fetchOrgTeams(orgId: string) {
  return check(
    await supabase
      .from("teams")
      .select("*, coach_assignments(id, coach_id, active), team_memberships(id, active)")
      .eq("organization_id", orgId)
      .order("age_group"),
  );
}

export async function fetchProfiles(ids: string[]) {
  if (!ids.length) return [];
  return check(await supabase.from("profiles").select("id, full_name").in("id", ids));
}

export async function fetchCoachTeams(userId: string) {
  return check(
    await supabase
      .from("coach_assignments")
      .select("id, teams(id, name, age_group, organizations(name))")
      .eq("coach_id", userId)
      .eq("active", true),
  );
}

export async function fetchRoster(teamId: string) {
  return check(
    await supabase
      .from("team_memberships")
      .select("id, started_at, player_profiles(id, full_name, birth_date, position)")
      .eq("team_id", teamId)
      .eq("active", true),
  );
}

export async function fetchTrainings() {
  return check(
    await supabase
      .from("training_sessions")
      .select("*, teams(name, age_group)")
      .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
      .order("starts_at"),
  );
}

export async function fetchNotifications() {
  return check(await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50));
}
export async function markAllRead() {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
  if (error) throw new Error(error.message);
}

export async function fetchAudit() {
  return check(await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(60));
}

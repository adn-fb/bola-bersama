
create type public.app_role as enum ('player','parent','coach','ssb_admin','organizer','association');
create type public.org_kind as enum ('ssb','organizer','association');
create type public.enrollment_status as enum ('pending','needs_info','approved','rejected');
create type public.verification_status as enum ('unverified','pending','verified','rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind public.org_kind not null,
  city text not null default '',
  verification public.verification_status not null default 'unverified',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.organizations to authenticated;
grant all on public.organizations to service_role;
alter table public.organizations enable row level security;
create policy "orgs readable" on public.organizations for select to authenticated using (true);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique nulls not distinct (user_id, role, organization_id)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table public.player_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date not null,
  position text not null default '',
  created_by uuid not null,
  created_at timestamptz not null default now()
);
grant select on public.player_profiles to authenticated;
grant all on public.player_profiles to service_role;
alter table public.player_profiles enable row level security;

create table public.guardian_relationships (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null,
  player_id uuid not null references public.player_profiles(id) on delete cascade,
  relation text not null default 'Orang Tua',
  created_at timestamptz not null default now(),
  unique (guardian_id, player_id)
);
grant select on public.guardian_relationships to authenticated;
grant all on public.guardian_relationships to service_role;
alter table public.guardian_relationships enable row level security;

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.player_profiles(id) on delete cascade,
  guardian_id uuid not null,
  kind text not null,
  granted boolean not null,
  created_at timestamptz not null default now()
);
grant select on public.consent_records to authenticated;
grant all on public.consent_records to service_role;
alter table public.consent_records enable row level security;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  age_group text not null,
  created_at timestamptz not null default now()
);
grant select on public.teams to authenticated;
grant all on public.teams to service_role;
alter table public.teams enable row level security;
create policy "teams readable" on public.teams for select to authenticated using (true);

create table public.coach_assignments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  coach_id uuid not null,
  active boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
grant select on public.coach_assignments to authenticated;
grant all on public.coach_assignments to service_role;
alter table public.coach_assignments enable row level security;

create table public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.player_profiles(id) on delete cascade,
  active boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
grant select on public.team_memberships to authenticated;
grant all on public.team_memberships to service_role;
alter table public.team_memberships enable row level security;

create table public.enrollment_requests (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.player_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  requested_by uuid not null,
  note text not null default '',
  status public.enrollment_status not null default 'pending',
  team_id uuid references public.teams(id),
  decided_by uuid,
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.enrollment_requests to authenticated;
grant all on public.enrollment_requests to service_role;
alter table public.enrollment_requests enable row level security;

create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  location text not null default '',
  created_by uuid not null,
  created_at timestamptz not null default now()
);
grant select on public.training_sessions to authenticated;
grant all on public.training_sessions to service_role;
alter table public.training_sessions enable row level security;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notif read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notif update" on public.notifications for update to authenticated using (user_id = auth.uid());

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  organization_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;

-- helper functions
create or replace function public.has_org_role(_uid uuid, _org uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from user_roles where user_id=_uid and organization_id=_org and role=_role)
$$;
create or replace function public.is_guardian(_uid uuid, _player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from guardian_relationships where guardian_id=_uid and player_id=_player)
$$;
create or replace function public.is_team_coach(_uid uuid, _team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from coach_assignments where coach_id=_uid and team_id=_team and active)
$$;
create or replace function public.is_team_admin(_uid uuid, _team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from teams t join user_roles r on r.organization_id=t.organization_id
    where t.id=_team and r.user_id=_uid and r.role='ssb_admin')
$$;
create or replace function public.can_view_player(_uid uuid, _player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select is_guardian(_uid,_player)
  or exists(select 1 from team_memberships m where m.player_id=_player and m.active
            and (is_team_coach(_uid,m.team_id) or is_team_admin(_uid,m.team_id)))
  or exists(select 1 from enrollment_requests e where e.player_id=_player
            and has_org_role(_uid,e.organization_id,'ssb_admin'))
$$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "player visible" on public.player_profiles for select to authenticated using (public.can_view_player(auth.uid(), id));
create policy "guardian rel" on public.guardian_relationships for select to authenticated using (guardian_id = auth.uid());
create policy "consent own" on public.consent_records for select to authenticated using (guardian_id = auth.uid());
create policy "coach assignments" on public.coach_assignments for select to authenticated using (coach_id = auth.uid() or public.is_team_admin(auth.uid(), team_id));
create policy "memberships" on public.team_memberships for select to authenticated using (public.is_guardian(auth.uid(), player_id) or public.is_team_coach(auth.uid(), team_id) or public.is_team_admin(auth.uid(), team_id));
create policy "enrollments" on public.enrollment_requests for select to authenticated using (requested_by = auth.uid() or public.is_guardian(auth.uid(), player_id) or public.has_org_role(auth.uid(), organization_id, 'ssb_admin'));
create policy "trainings" on public.training_sessions for select to authenticated using (
  public.is_team_coach(auth.uid(), team_id) or public.is_team_admin(auth.uid(), team_id)
  or exists(select 1 from team_memberships m where m.team_id=training_sessions.team_id and m.active and public.is_guardian(auth.uid(), m.player_id)));
create policy "audit" on public.audit_logs for select to authenticated using (actor_id = auth.uid() or (organization_id is not null and public.has_org_role(auth.uid(), organization_id, 'ssb_admin')));

-- signup trigger
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RPCs (all writes go through these, enforcing authorization server-side)
create or replace function public.claim_parent_role() returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Belum masuk'; end if;
  insert into user_roles(user_id, role) values (auth.uid(),'parent') on conflict do nothing;
end $$;

create or replace function public.dev_claim_demo_role(_org uuid, _role public.app_role) returns void language plpgsql security definer set search_path = public as $$
declare k org_kind;
begin
  if auth.uid() is null then raise exception 'Belum masuk'; end if;
  select kind into k from organizations where id=_org and is_demo;
  if k is null then raise exception 'Hanya organisasi demo yang bisa diklaim'; end if;
  if not ((k='ssb' and _role='ssb_admin') or (k='organizer' and _role='organizer') or (k='association' and _role='association')) then
    raise exception 'Peran tidak cocok dengan jenis organisasi'; end if;
  insert into user_roles(user_id, role, organization_id) values (auth.uid(), _role, _org) on conflict do nothing;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id) values (auth.uid(), _org, 'dev_claim_role', 'organization', _org);
end $$;

create or replace function public.create_child(_name text, _birth date, _position text, _consent_data boolean, _consent_media boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if not exists(select 1 from user_roles where user_id=auth.uid() and role='parent') then raise exception 'Hanya orang tua/wali'; end if;
  if length(trim(_name)) < 2 then raise exception 'Nama terlalu pendek'; end if;
  if _birth > current_date or _birth < current_date - interval '19 years' then raise exception 'Tanggal lahir tidak valid untuk usia dini'; end if;
  if not _consent_data then raise exception 'Persetujuan pengolahan data wajib diberikan'; end if;
  insert into player_profiles(full_name, birth_date, position, created_by) values (trim(_name), _birth, coalesce(_position,''), auth.uid()) returning id into pid;
  insert into guardian_relationships(guardian_id, player_id) values (auth.uid(), pid);
  insert into consent_records(player_id, guardian_id, kind, granted) values (pid, auth.uid(), 'data_processing', true), (pid, auth.uid(), 'media_usage', coalesce(_consent_media,false));
  insert into audit_logs(actor_id, action, entity, entity_id) values (auth.uid(), 'create_child', 'player_profile', pid);
  return pid;
end $$;

create or replace function public.request_enrollment(_player uuid, _org uuid, _note text) returns uuid language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  if not is_guardian(auth.uid(), _player) then raise exception 'Anda bukan wali pemain ini'; end if;
  if not exists(select 1 from organizations where id=_org and kind='ssb') then raise exception 'SSB tidak ditemukan'; end if;
  if exists(select 1 from enrollment_requests where player_id=_player and organization_id=_org and status in ('pending','needs_info','approved')) then
    raise exception 'Sudah ada pendaftaran aktif ke SSB ini'; end if;
  insert into enrollment_requests(player_id, organization_id, requested_by, note) values (_player, _org, auth.uid(), coalesce(_note,'')) returning id into rid;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id) values (auth.uid(), _org, 'request_enrollment', 'enrollment_request', rid);
  insert into notifications(user_id, title, body)
    select user_id, 'Permintaan pendaftaran baru', 'Ada pendaftaran pemain baru yang menunggu review.' from user_roles where organization_id=_org and role='ssb_admin';
  return rid;
end $$;

create or replace function public.decide_enrollment(_req uuid, _decision public.enrollment_status, _team uuid, _note text) returns void language plpgsql security definer set search_path = public as $$
declare r enrollment_requests; pname text;
begin
  select * into r from enrollment_requests where id=_req for update;
  if r.id is null then raise exception 'Permintaan tidak ditemukan'; end if;
  if not has_org_role(auth.uid(), r.organization_id, 'ssb_admin') then raise exception 'Tidak berwenang'; end if;
  if r.status not in ('pending','needs_info') then raise exception 'Permintaan sudah diputuskan'; end if;
  if _decision = 'pending' then raise exception 'Keputusan tidak valid'; end if;
  if _decision = 'approved' then
    if _team is null or not exists(select 1 from teams where id=_team and organization_id=r.organization_id) then raise exception 'Pilih tim dari SSB ini'; end if;
    insert into team_memberships(team_id, player_id) values (_team, r.player_id);
  elsif coalesce(trim(_note),'') = '' then raise exception 'Alasan wajib diisi';
  end if;
  update enrollment_requests set status=_decision, team_id=case when _decision='approved' then _team end, decided_by=auth.uid(), decision_note=_note, decided_at=now() where id=_req;
  select full_name into pname from player_profiles where id=r.player_id;
  insert into notifications(user_id, title, body)
    select guardian_id, 'Status pendaftaran ' || pname,
      case _decision when 'approved' then 'Disetujui dan sudah masuk tim.' when 'rejected' then 'Ditolak: ' || _note else 'Perlu dilengkapi: ' || _note end
    from guardian_relationships where player_id=r.player_id;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id, details)
    values (auth.uid(), r.organization_id, 'decide_enrollment', 'enrollment_request', _req, jsonb_build_object('decision', _decision, 'team', _team, 'note', _note));
end $$;

create or replace function public.create_team(_org uuid, _name text, _age text) returns uuid language plpgsql security definer set search_path = public as $$
declare tid uuid;
begin
  if not has_org_role(auth.uid(), _org, 'ssb_admin') then raise exception 'Tidak berwenang'; end if;
  if length(trim(_name)) < 2 then raise exception 'Nama tim terlalu pendek'; end if;
  insert into teams(organization_id, name, age_group) values (_org, trim(_name), _age) returning id into tid;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id) values (auth.uid(), _org, 'create_team', 'team', tid);
  return tid;
end $$;

create or replace function public.assign_coach(_team uuid, _email text) returns void language plpgsql security definer set search_path = public as $$
declare cid uuid; org uuid;
begin
  if not is_team_admin(auth.uid(), _team) then raise exception 'Tidak berwenang'; end if;
  select id into cid from auth.users where lower(email)=lower(trim(_email));
  if cid is null then raise exception 'Akun pelatih dengan email ini belum terdaftar'; end if;
  select organization_id into org from teams where id=_team;
  if exists(select 1 from coach_assignments where team_id=_team and coach_id=cid and active) then raise exception 'Pelatih sudah ditugaskan'; end if;
  insert into coach_assignments(team_id, coach_id) values (_team, cid);
  insert into user_roles(user_id, role, organization_id) values (cid, 'coach', org) on conflict do nothing;
  insert into notifications(user_id, title, body) values (cid, 'Penugasan pelatih baru', 'Anda ditugaskan melatih tim baru.');
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id, details) values (auth.uid(), org, 'assign_coach', 'team', _team, jsonb_build_object('coach', cid));
end $$;

create or replace function public.create_training(_team uuid, _title text, _starts timestamptz, _location text) returns uuid language plpgsql security definer set search_path = public as $$
declare sid uuid; org uuid;
begin
  if not (is_team_coach(auth.uid(), _team) or is_team_admin(auth.uid(), _team)) then raise exception 'Tidak berwenang'; end if;
  if length(trim(_title)) < 2 then raise exception 'Judul terlalu pendek'; end if;
  insert into training_sessions(team_id, title, starts_at, location, created_by) values (_team, trim(_title), _starts, coalesce(_location,''), auth.uid()) returning id into sid;
  select organization_id into org from teams where id=_team;
  insert into notifications(user_id, title, body)
    select distinct g.guardian_id, 'Jadwal latihan baru', trim(_title) from team_memberships m join guardian_relationships g on g.player_id=m.player_id where m.team_id=_team and m.active;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id) values (auth.uid(), org, 'create_training', 'training_session', sid);
  return sid;
end $$;

revoke execute on function public.claim_parent_role, public.dev_claim_demo_role, public.create_child, public.request_enrollment, public.decide_enrollment, public.create_team, public.assign_coach, public.create_training from anon, public;
grant execute on function public.claim_parent_role, public.dev_claim_demo_role, public.create_child, public.request_enrollment, public.decide_enrollment, public.create_team, public.assign_coach, public.create_training to authenticated;

-- demo organizations (fiktif)
insert into public.organizations(id, name, kind, city, verification, is_demo) values
 ('11111111-1111-1111-1111-111111111111','SSB Garuda Muda','ssb','Bandung','verified',true),
 ('22222222-2222-2222-2222-222222222222','SSB Tunas Samudra','ssb','Surabaya','pending',true),
 ('33333333-3333-3333-3333-333333333333','Liga Bocah Nusantara','organizer','Jakarta','verified',true),
 ('44444444-4444-4444-4444-444444444444','Asosiasi Kota Bandung (Demo)','association','Bandung','verified',true);
insert into public.teams(organization_id, name, age_group) values
 ('11111111-1111-1111-1111-111111111111','Garuda Muda U-10','U-10'),
 ('11111111-1111-1111-1111-111111111111','Garuda Muda U-12','U-12'),
 ('22222222-2222-2222-2222-222222222222','Tunas Samudra U-12','U-12');

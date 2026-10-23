-- Uji alur Fase 1 + batas akses. Dijalankan dalam transaksi dan di-ROLLBACK.
-- psql -v ON_ERROR_STOP=1 -f supabase/tests/phase1_access.sql
begin;

create temp table ids(k text primary key, v uuid);
grant all on ids to authenticated;
create or replace function pg_temp.as_user(u text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', u, 'role','authenticated')::text, true);
$$;
set local role authenticated;

-- Wali A membuat profil anak & mendaftar ke SSB Garuda Muda
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select claim_parent_role();
insert into ids values ('child', create_child('Raka Pratama', '2015-03-10', 'Gelandang', true, false));
insert into ids select 'req', request_enrollment((select v from ids where k='child'), '11111111-1111-1111-1111-111111111111', '');

-- Wali B tidak boleh melihat anak Wali A
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000002');
do $$ begin
  if (select count(*) from player_profiles) <> 0 then raise exception 'FAIL: wali lain melihat anak'; end if;
  begin perform request_enrollment((select v from ids where k='child'), '11111111-1111-1111-1111-111111111111', ''); raise exception 'FAIL_X';
  exception when others then if sqlerrm = 'FAIL_X' then raise exception 'FAIL: wali lain bisa mendaftarkan'; end if; end;
end $$;

-- Pelatih (belum ditugaskan) tidak melihat apa pun
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000004');
do $$ begin if (select count(*) from player_profiles) <> 0 then raise exception 'FAIL: pelatih tanpa tugas melihat pemain'; end if; end $$;

-- Admin SSB: tidak bisa memutuskan sebelum punya peran
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000003');
do $$ begin
  begin perform decide_enrollment((select v from ids where k='req'), 'approved', null, ''); raise exception 'FAIL_X';
  exception when others then if sqlerrm = 'FAIL_X' then raise exception 'FAIL: non-admin memutuskan'; end if; end;
end $$;
select dev_claim_demo_role('11111111-1111-1111-1111-111111111111', 'ssb_admin');
insert into ids select 'team', id from teams where name = 'Garuda Muda U-12';
insert into ids select 'team2', id from teams where name = 'Garuda Muda U-10';
do $$ begin if (select count(*) from player_profiles) <> 1 then raise exception 'FAIL: admin tidak melihat pemohon'; end if; end $$;
select decide_enrollment((select v from ids where k='req'), 'approved', (select v from ids where k='team'), 'Selamat bergabung');
select assign_coach((select v from ids where k='team'), 'coach@test.local');
select assign_coach((select v from ids where k='team2'), 'coach2@test.local');

-- Pelatih tim U-12 melihat pemain; pelatih U-10 tidak
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000004');
do $$ begin if (select count(*) from player_profiles) <> 1 then raise exception 'FAIL: pelatih tim tidak melihat pemain'; end if; end $$;
select create_training((select v from ids where k='team'), 'Passing & kontrol', now() + interval '1 day', 'Lapangan Sidolig');
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000005');
do $$ begin
  if (select count(*) from player_profiles) <> 0 then raise exception 'FAIL: pelatih tim lain melihat pemain'; end if;
  begin perform create_training((select v from ids where k='team'), 'X', now(), ''); raise exception 'FAIL_X';
  exception when others then if sqlerrm = 'FAIL_X' then raise exception 'FAIL: pelatih lain membuat latihan'; end if; end;
end $$;

-- Wali A melihat jadwal & notifikasi; Wali B tidak
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
do $$ begin
  if (select count(*) from training_sessions) <> 1 then raise exception 'FAIL: wali tidak melihat jadwal'; end if;
  if (select count(*) from notifications) < 2 then raise exception 'FAIL: wali tidak menerima notifikasi'; end if;
  if (select count(*) from team_memberships where active) <> 1 then raise exception 'FAIL: keanggotaan tim tidak terlihat'; end if;
end $$;
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000002');
do $$ begin
  if (select count(*) from training_sessions) <> 0 then raise exception 'FAIL: wali lain melihat jadwal'; end if;
  begin insert into player_profiles(full_name, birth_date, created_by) values ('x', '2015-01-01', auth.uid()); raise exception 'FAIL_X';
  exception when others then if sqlerrm = 'FAIL_X' then raise exception 'FAIL: tulis langsung ke tabel diizinkan'; end if; end;
end $$;

select 'SEMUA UJI LULUS' as hasil;
rollback;

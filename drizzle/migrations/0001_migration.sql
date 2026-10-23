
create policy "org admins see member profiles" on public.profiles for select to authenticated using (
  exists(select 1 from public.user_roles r where r.user_id = profiles.id and r.organization_id is not null and public.has_org_role(auth.uid(), r.organization_id, 'ssb_admin'))
);

create or replace function public.is_association_official(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from user_roles where user_id=_uid and role='association')
$$;

create policy "association sees verification audit" on public.audit_logs for select to authenticated using (
  entity = 'organization' and public.is_association_official(auth.uid())
);

create or replace function public.submit_verification(_org uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not has_org_role(auth.uid(), _org, 'ssb_admin') then raise exception 'Tidak berwenang'; end if;
  if (select verification from organizations where id=_org) in ('pending','verified') then raise exception 'Verifikasi sudah diajukan atau aktif'; end if;
  update organizations set verification='pending' where id=_org;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id) values (auth.uid(), _org, 'submit_verification', 'organization', _org);
end $$;

create or replace function public.decide_verification(_org uuid, _status public.verification_status, _note text) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_association_official(auth.uid()) then raise exception 'Hanya pengurus asosiasi'; end if;
  if _status not in ('verified','rejected','unverified') then raise exception 'Keputusan tidak valid'; end if;
  if (select verification from organizations where id=_org) <> 'pending' then raise exception 'Organisasi tidak dalam antrean verifikasi'; end if;
  if _status <> 'verified' and coalesce(trim(_note),'')='' then raise exception 'Alasan wajib diisi'; end if;
  update organizations set verification=_status where id=_org;
  insert into audit_logs(actor_id, organization_id, action, entity, entity_id, details)
    values (auth.uid(), _org, 'decide_verification', 'organization', _org, jsonb_build_object('status', _status, 'note', _note));
  insert into notifications(user_id, title, body)
    select user_id, 'Hasil verifikasi organisasi', case _status when 'verified' then 'Organisasi Anda terverifikasi.' else 'Perlu tindak lanjut: ' || _note end
    from user_roles where organization_id=_org and role='ssb_admin';
end $$;

revoke execute on function public.submit_verification, public.decide_verification from anon, public;
grant execute on function public.submit_verification, public.decide_verification to authenticated;

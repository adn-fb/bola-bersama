"""Uji alur Fase 1 dan batas akses melalui API publik (RLS + RPC berlaku).
Butuh 5 akun uji (lihat README di AGENTS.md). Jalankan: python3 supabase/tests/phase1_access.py
"""
import os, sys, datetime, requests

URL = os.environ["SUPABASE_URL"]
KEY = os.environ["SUPABASE_PUBLISHABLE_KEY"]
PW = os.environ.get("TEST_PW", "Rahasia123!x")
SSB = "11111111-1111-1111-1111-111111111111"


def login(email):
    r = requests.post(f"{URL}/auth/v1/token?grant_type=password", headers={"apikey": KEY}, json={"email": email, "password": PW})
    r.raise_for_status()
    tok = r.json()["access_token"]
    return {"apikey": KEY, "Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


def rpc(h, name, **args):
    return requests.post(f"{URL}/rest/v1/rpc/{name}", headers=h, json=args)


def sel(h, path):
    r = requests.get(f"{URL}/rest/v1/{path}", headers=h)
    r.raise_for_status()
    return r.json()


fails = []
def check(cond, msg):
    print(("LULUS " if cond else "GAGAL ") + msg)
    if not cond:
        fails.append(msg)


A, B, ADM, C1, C2 = (login(e) for e in ["wali.a@test.local", "wali.b@test.local", "admin@test.local", "coach@test.local", "coach2@test.local"])

rpc(A, "claim_parent_role"); rpc(B, "claim_parent_role")
r = rpc(A, "create_child", _name="Raka Pratama", _birth="2015-03-10", _position="Gelandang", _consent_data=True, _consent_media=False)
check(r.ok, "wali membuat profil anak"); child = r.json()
check(not rpc(A, "create_child", _name="Tanpa Izin", _birth="2015-03-10", _position="", _consent_data=False, _consent_media=False).ok, "profil ditolak tanpa persetujuan wali")
r = rpc(A, "request_enrollment", _player=child, _org=SSB, _note="")
check(r.ok, "wali mengajukan pendaftaran SSB"); req = r.json()

check(sel(B, f"player_profiles?id=eq.{child}") == [], "wali lain tidak melihat anak")
check(not rpc(B, "request_enrollment", _player=child, _org=SSB, _note="").ok, "wali lain tidak bisa mendaftarkan anak")
check(sel(C1, f"player_profiles?id=eq.{child}") == [], "pelatih tanpa tugas tidak melihat anak")
check(not rpc(ADM, "decide_enrollment", _req=req, _decision="approved", _team=None, _note="").ok, "non-admin tidak bisa memutuskan")
check(requests.post(f"{URL}/rest/v1/player_profiles", headers=B, json={"full_name": "x", "birth_date": "2015-01-01", "created_by": "00000000-0000-0000-0000-000000000000"}).status_code >= 400, "tulis langsung ke tabel diblokir")

rpc(ADM, "dev_claim_demo_role", _org=SSB, _role="ssb_admin")
teams = {t["name"]: t["id"] for t in sel(ADM, f"teams?organization_id=eq.{SSB}")}
t12, t10 = teams["Garuda Muda U-12"], teams["Garuda Muda U-10"]
check(len(sel(ADM, f"player_profiles?id=eq.{child}")) == 1, "admin SSB melihat pemohon")
check(not rpc(ADM, "decide_enrollment", _req=req, _decision="rejected", _team=None, _note="").ok, "penolakan wajib beralasan")
check(rpc(ADM, "decide_enrollment", _req=req, _decision="approved", _team=t12, _note="Selamat").ok, "admin menyetujui & menempatkan di tim")
check(rpc(ADM, "assign_coach", _team=t12, _email="coach@test.local").ok, "admin menugaskan pelatih U-12")
check(rpc(ADM, "assign_coach", _team=t10, _email="coach2@test.local").ok, "admin menugaskan pelatih U-10")

check(len(sel(C1, f"player_profiles?id=eq.{child}")) == 1, "pelatih tim melihat pemain yang ditugaskan")
check(sel(C2, f"player_profiles?id=eq.{child}") == [], "pelatih tim lain tidak melihat pemain")
when = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat() + "Z"
check(rpc(C1, "create_training", _team=t12, _title="Passing & kontrol", _starts=when, _location="Lapangan Sidolig").ok, "pelatih membuat sesi latihan")
check(not rpc(C2, "create_training", _team=t12, _title="X", _starts=when, _location="").ok, "pelatih lain tidak bisa membuat latihan tim ini")

check(len(sel(A, f"training_sessions?team_id=eq.{t12}")) >= 1, "wali melihat jadwal anak")
check(len(sel(A, "notifications?title=like.Status*")) >= 1, "wali menerima keputusan pendaftaran")
check(sel(B, f"training_sessions?team_id=eq.{t12}") == [], "wali lain tidak melihat jadwal")

print("\nSEMUA UJI LULUS" if not fails else f"\n{len(fails)} UJI GAGAL")
sys.exit(1 if fails else 0)

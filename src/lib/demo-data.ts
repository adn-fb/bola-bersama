// DATA PENGEMBANGAN (fiktif). Kompetisi & pertandingan belum tersambung ke database (Fase 3).
import type { MatchResult } from "./domain";

export const demoCompetitions = [
  {
    id: "c1",
    name: "Piala Liga Bocah Nusantara 2026",
    organizer: "Liga Bocah Nusantara",
    category: "U-12",
    maxAge: 12,
    referenceDate: "2026-12-01",
    venue: "Lapangan Sidolig, Bandung",
    deadline: "2026-11-15",
    status: "Pendaftaran Dibuka",
    approval: "Disetujui Asosiasi",
    teams: 8,
    requirements: ["Minimal 12 pemain terdaftar", "Akta lahir terverifikasi", "Persetujuan wali aktif"],
  },
  {
    id: "c2",
    name: "Festival Grassroots Pesisir U-10",
    organizer: "Liga Bocah Nusantara",
    category: "U-10",
    maxAge: 10,
    referenceDate: "2027-01-15",
    venue: "GOR Pantai Kenjeran, Surabaya",
    deadline: "2026-12-20",
    status: "Menunggu Persetujuan Asosiasi",
    approval: "Dalam Review",
    teams: 0,
    requirements: ["Minimal 9 pemain", "Persetujuan wali aktif"],
  },
];

export const demoApplications = [
  { id: "a1", ssb: "SSB Garuda Muda", team: "Garuda Muda U-12", players: 14, issues: 0, status: "Menunggu Review" },
  { id: "a2", ssb: "SSB Tunas Samudra", team: "Tunas Samudra U-12", players: 11, issues: 2, status: "Perlu Koreksi" },
  { id: "a3", ssb: "SSB Rajawali Cilik", team: "Rajawali U-12", players: 15, issues: 0, status: "Disetujui" },
  { id: "a4", ssb: "SSB Bintang Timur", team: "Bintang Timur U-12", players: 13, issues: 0, status: "Disetujui" },
];

export const demoMatches: (MatchResult & { id: string; time: string; venue: string })[] = [
  { id: "m1", home: "Garuda Muda U-12", away: "Rajawali U-12", homeGoals: 2, awayGoals: 1, state: "finalized", time: "2026-11-01T08:00:00+07:00", venue: "Lapangan A" },
  { id: "m2", home: "Bintang Timur U-12", away: "Tunas Samudra U-12", homeGoals: 0, awayGoals: 0, state: "finalized", time: "2026-11-01T09:30:00+07:00", venue: "Lapangan B" },
  { id: "m3", home: "Garuda Muda U-12", away: "Bintang Timur U-12", homeGoals: 0, awayGoals: 0, state: "ready", time: "2026-11-08T08:00:00+07:00", venue: "Lapangan A" },
  { id: "m4", home: "Rajawali U-12", away: "Tunas Samudra U-12", homeGoals: 0, awayGoals: 0, state: "scheduled", time: "2026-11-08T09:30:00+07:00", venue: "Lapangan B" },
];

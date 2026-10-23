import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import field from "@/assets/landing-field.jpg";
import { ShieldCheck, Users, Trophy, ClipboardCheck, Landmark, Baby } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BOLAID — Ekosistem Sepak Bola Usia Dini Indonesia" },
      { name: "description", content: "Hubungkan pemain, orang tua, pelatih, SSB, penyelenggara turnamen, dan asosiasi dalam satu platform yang aman untuk anak." },
      { property: "og:title", content: "BOLAID — Ekosistem Sepak Bola Usia Dini" },
      { property: "og:description", content: "Satu ekosistem terhubung untuk sepak bola usia dini Indonesia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const roles = [
  { icon: Baby, t: "Orang Tua/Wali", d: "Pantau jadwal, kehadiran, dan perkembangan anak." },
  { icon: ClipboardCheck, t: "Pelatih", d: "Catat latihan dan evaluasi dalam beberapa ketukan." },
  { icon: Users, t: "SSB & Klub", d: "Kelola pendaftaran, tim, dan pelatih secara rapi." },
  { icon: Trophy, t: "Penyelenggara", d: "Jalankan kompetisi dengan hasil resmi yang tercatat." },
  { icon: Landmark, t: "Asosiasi", d: "Verifikasi organisasi dan awasi kompetisi." },
  { icon: ShieldCheck, t: "Aman untuk Anak", d: "Data anak hanya dibagikan sesuai izin wali." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="pitch-lines text-navy-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl font-extrabold tracking-tight">
            BOLA<span className="text-lime">ID</span>
          </span>
          <Button asChild variant="secondary" size="sm"><Link to="/auth">Masuk</Link></Button>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 px-5 pb-12 pt-6 md:grid-cols-2 md:items-center md:pb-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-lime">{brand.tagline}</p>
            <h1 className="text-4xl font-extrabold leading-[1.05] md:text-5xl">
              Satu lapangan untuk semua yang membesarkan pemain muda.
            </h1>
            <p className="mt-4 max-w-md text-navy-foreground/75">
              Pemain, orang tua, pelatih, SSB, penyelenggara, dan asosiasi bekerja dengan data yang sama — masing-masing hanya melihat yang menjadi haknya.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Daftar gratis</Link></Button>
              <Button asChild size="lg" variant="secondary"><Link to="/auth">Saya sudah punya akun</Link></Button>
            </div>
          </div>
          <img src={field} alt="Anak-anak berlatih sepak bola di lapangan SSB" className="aspect-[4/3] w-full rounded-2xl object-cover" width={1280} height={896} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="text-2xl font-bold">Dibuat untuk ekosistem, bukan sekadar dasbor</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-xl border bg-card p-4">
              <I className="size-5 text-primary" />
              <p className="mt-2 font-semibold">{t}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © 2026 {brand.name}. Semua nama dan data contoh bersifat fiktif.
      </footer>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode | undefined; redirect?: string | undefined } => ({
    mode: s["mode"] === "signup" || s["mode"] === "forgot" ? s["mode"] : undefined,
    redirect: typeof s["redirect"] === "string" && s["redirect"].startsWith("/") ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Masuk — BOLAID" },
      { name: "description", content: "Masuk atau daftar ke BOLAID." },
      { property: "og:title", content: "Masuk — BOLAID" },
      { property: "og:description", content: "Masuk atau daftar ke BOLAID." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: search.redirect ?? "/beranda", replace: true });
      } else if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Isi nama lengkap Anda.");
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/beranda", data: { full_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/beranda", replace: true });
        else setSent("Cek email Anda untuk mengonfirmasi akun, lalu masuk.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        setSent("Tautan atur ulang kata sandi sudah dikirim ke email Anda.");
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : "Gagal";
      toast.error(m.includes("Invalid login") ? "Email atau kata sandi salah." : m);
    } finally {
      setBusy(false);
    }
  }

  const title = { signin: "Masuk ke BOLAID", signup: "Buat akun", forgot: "Lupa kata sandi" }[mode];
  return (
    <div className="flex min-h-screen flex-col pitch-lines">
      <div className="px-5 py-5">
        <Link to="/" className="font-display text-xl font-extrabold text-navy-foreground">BOLA<span className="text-lime">ID</span></Link>
      </div>
      <div className="mt-auto rounded-t-3xl bg-background px-5 pb-10 pt-8 md:m-auto md:w-full md:max-w-md md:rounded-3xl">
        <h1 className="text-2xl font-bold">{title}</h1>
        {sent ? (
          <div className="mt-6 rounded-xl bg-success-soft p-4 text-sm text-success">{sent}</div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama lengkap</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" autoComplete="name" required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" autoComplete="email" required />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="pw">Kata sandi</Label>
                <Input id="pw" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" autoComplete={mode === "signup" ? "new-password" : "current-password"} required />
                {mode === "signup" && <p className="text-xs text-muted-foreground">Minimal 8 karakter.</p>}
              </div>
            )}
            <Button type="submit" size="lg" className="h-12 w-full" disabled={busy}>
              {busy ? "Memproses…" : mode === "signin" ? "Masuk" : mode === "signup" ? "Daftar" : "Kirim tautan"}
            </Button>
          </form>
        )}
        <div className="mt-6 space-y-2 text-center text-sm">
          {mode === "signin" && (
            <>
              <button className="text-primary underline-offset-4 hover:underline" onClick={() => { setMode("forgot"); setSent(null); }}>Lupa kata sandi?</button>
              <p className="text-muted-foreground">Belum punya akun? <button className="font-semibold text-primary" onClick={() => { setMode("signup"); setSent(null); }}>Daftar</button></p>
            </>
          )}
          {mode !== "signin" && (
            <button className="font-semibold text-primary" onClick={() => { setMode("signin"); setSent(null); }}>Kembali ke halaman masuk</button>
          )}
        </div>
      </div>
    </div>
  );
}

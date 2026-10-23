import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Atur ulang kata sandi — BOLAID" },
      { name: "description", content: "Buat kata sandi baru untuk akun BOLAID." },
      { property: "og:title", content: "Atur ulang kata sandi — BOLAID" },
      { property: "og:description", content: "Buat kata sandi baru untuk akun BOLAID." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Kata sandi diperbarui.");
    navigate({ to: "/beranda", replace: true });
  }
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-2xl font-bold">Kata sandi baru</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pw">Kata sandi baru</Label>
          <Input id="pw" type="password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className="h-12" required />
        </div>
        <Button type="submit" className="h-12 w-full" disabled={busy}>Simpan</Button>
      </form>
    </div>
  );
}

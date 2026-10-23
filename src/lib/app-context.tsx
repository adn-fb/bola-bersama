import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { fetchContexts, type Ctx } from "./api";

interface AppCtx {
  user: User;
  contexts: Ctx[];
  active: Ctx | null;
  setActive: (key: string) => void;
  loading: boolean;
  refetch: () => void;
}
const C = createContext<AppCtx | null>(null);
const STORE = "bolaid.activeContext";

export function AppContextProvider({ user, children }: { user: User; children: ReactNode }) {
  const q = useQuery({ queryKey: ["contexts", user.id], queryFn: fetchContexts });
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => setKey(localStorage.getItem(STORE)), []);
  const contexts = q.data ?? [];
  const active = useMemo(
    () => contexts.find((c) => c.key === key) ?? contexts.find((c) => c.role !== "player") ?? contexts[0] ?? null,
    [contexts, key],
  );
  const value: AppCtx = {
    user,
    contexts,
    active,
    loading: q.isLoading,
    refetch: () => void q.refetch(),
    setActive: (k) => {
      localStorage.setItem(STORE, k);
      setKey(k);
    },
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useApp() {
  const v = useContext(C);
  if (!v) throw new Error("useApp di luar AppContextProvider");
  return v;
}

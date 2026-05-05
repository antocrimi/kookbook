"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "./browser";

const PUBLIC_PATHS = new Set(["/", "/sign-in"]);

type AuthState =
  | { status: "loading" }
  | { status: "ready"; session: Session | null };

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setState({ status: "ready", session: data.session });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ status: "ready", session });
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const isPublic = PUBLIC_PATHS.has(normalized);

  useEffect(() => {
    if (state.status !== "ready") return;
    if (!state.session && !isPublic) {
      router.replace("/sign-in");
    }
  }, [state, isPublic, router]);

  if (state.status === "loading") return null;
  if (!state.session && !isPublic) return null;

  return <>{children}</>;
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOut() {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button size="xs" variant="ghost" onClick={signOut}>
      Sign out
    </Button>
  );
}

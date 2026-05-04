"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { SignOut } from "../recipes/SignOut";
import styles from "./page.module.scss";

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.wordmark}>cuckoobook</h1>
        <div className={styles.headerRight}>
          <Button asChild size="sm" variant="ghost">
            <Link href="/recipes">Recipes</Link>
          </Button>
          <SignOut />
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.title}>Settings</h2>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Profile</h3>
          <p className={styles.profileEmail}>{email ?? ""}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Password</h3>
          <ChangePasswordForm />
        </section>
      </main>
    </div>
  );
}

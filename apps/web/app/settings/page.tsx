import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@cuckoobook/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { SignOut } from "../recipes/SignOut";
import styles from "./page.module.scss";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

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
          <p className={styles.profileEmail}>{user.email}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Password</h3>
          <ChangePasswordForm />
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import styles from "./RecipeCard.module.scss";

interface RecipeCardProps {
  id: string;
  title: string;
  servings: number;
  photoUrl: string | null;
}

export function RecipeCard({ id, title, servings, photoUrl }: RecipeCardProps) {
  return (
    <Link href={`/recipe?id=${id}`} className={styles.card}>
      <div className={styles.photo}>
        {photoUrl ? (
          <Image src={photoUrl} alt={title} fill className="object-cover" sizes="(max-width: 600px) 50vw, 33vw" />
        ) : (
          <div className={styles.photoPlaceholder} />
        )}
      </div>
      <div className={styles.info}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.meta}>{servings} servings</span>
      </div>
    </Link>
  );
}

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { recipes } from "../data";

export default function PrototypeRecipesPage() {
  return (
    <div className="page" id="index">
      <header className="home-header">
        <button className="menu-btn" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <img className="home-logo" src="/prototype/assets/logo.png" alt="Cuckoobook" />
        <button className="add-btn" aria-label="Add recipe">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2v16M2 10h16" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="saved-section">
        <div className="saved-header">
          <h2 className="saved-title">Saved Recipes</h2>
          <button className="saved-chevron" aria-label="Filter">
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
              <path
                d="M1 1l8 8 8-8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <hr className="saved-divider" />
      </div>

      <div className="recipe-grid">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/prototype/recipe/${r.slug}`} className="r-card">
            <img className="r-card-photo" src={r.photo} alt={r.title} />
            <div className="r-card-info">
              <div className="r-card-title">{r.title}</div>
              <div className="r-card-time">{r.timeMin} MIN</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

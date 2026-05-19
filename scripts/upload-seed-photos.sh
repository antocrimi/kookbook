#!/usr/bin/env bash
# Upload demo recipe photos to the recipe-photos Supabase Storage bucket.
#
# Usage:
#   scripts/upload-seed-photos.sh local
#   scripts/upload-seed-photos.sh linked
#
# Idempotent: `supabase storage cp` overwrites existing objects.

set -euo pipefail

target="${1:-}"
case "$target" in
  local)  flag="--local" ;;
  linked) flag="--linked" ;;
  *)
    echo "Usage: $0 {local|linked}" >&2
    exit 1
    ;;
esac

cd "$(dirname "$0")/.."
assets="apps/web/public/prototype/assets"

# slug:source-filename pairs. The seed/<slug>.<ext> targets must match the
# original_photo_path values in supabase/seed_recipes.sql.
mappings=(
  "lemony-orzo:AS-Lemony-Orzo-with-Asparagus-pgmk-threeByTwoMediumAt2X.jpg.webp"
  "crispy-gnocchi:as-cheesy-baked-gnocchi-threeByTwoMediumAt2X-v2.jpg.webp"
  "zucchini-pancakes:el-zucchini-pancakes-threeByTwoMediumAt2X-v4.jpg"
  "rhubarb-macaroon-tart:SS-Rhubarb-Macaroon-Tart-wvbc-threeByTwoMediumAt2X.jpg.webp"
  "sheet-pan-feta:merlin_209335479_52115ec4-9a9b-483e-b749-ed40dc44a69d-threeByTwoMediumAt2X.jpg.webp"
  "lemon-butter-salmon:15FD-KO-EASTERREX-GK-Honey-Lemon-Salmon-kcht-threeByTwoMediumAt2X-v2.jpg.webp"
  "spiced-pea-stew:16EATrex-pea-stew-qcbp-threeByTwoMediumAt2X.jpg.webp"
)

for entry in "${mappings[@]}"; do
  slug="${entry%%:*}"
  filename="${entry#*:}"
  ext="${filename##*.}"
  src="$assets/$filename"
  dst="ss:///recipe-photos/seed/$slug.$ext"
  echo "→ $src → $dst"
  supabase storage cp --experimental "$flag" "$src" "$dst"
done

echo "Done. Re-run with the other target ($([ "$target" = local ] && echo linked || echo local)) to mirror."

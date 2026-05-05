-- Flip the recipe-photos bucket to public-read.
--
-- Why: the app renders recipe photos via plain <img src="..."> tags whose
-- requests don't carry the user's JWT. With a private bucket, that 404s
-- (or 401s) from any other origin / fresh page load. For a closed-list
-- personal recipe app the recipes themselves are RLS-protected; the
-- photos are not sensitive (someone with a guessable storage key could
-- fetch the image, but they can't see the structured recipe).
--
-- Owner-only INSERT/UPDATE/DELETE policies are unchanged — the bucket
-- being public only affects SELECT (read).

update storage.buckets set public = true where id = 'recipe-photos';

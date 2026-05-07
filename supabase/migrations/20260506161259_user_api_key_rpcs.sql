-- RPCs that mediate access to per-user API keys stored in Supabase Vault.
--
-- Why RPCs? Vault tables (vault.secrets / vault.decrypted_secrets) live in
-- the `vault` schema, which isn't exposed via PostgREST. SECURITY DEFINER
-- functions in `public` give the authenticated role a narrow, RLS-equivalent
-- door into Vault: each function trusts auth.uid() to identify the caller
-- and only ever touches that user's row.
--
-- All three are restricted to the `authenticated` role; anon and public
-- callers can't reach them. The Edge Function (which holds the user's JWT)
-- calls them with the user's role context, so auth.uid() resolves correctly
-- even from server-side code.
--
-- Architecture: see docs/prd/04-llm-integration.md "Architecture (data flow)"
-- and "Decisions locked → Encryption layer".

-- ─── set_user_api_key ────────────────────────────────────────────────────────
-- Creates or replaces the caller's secret for `provider_in`. On first call
-- creates a new vault secret and links it via user_api_keys.secret_id; on
-- subsequent calls overwrites the existing secret atomically.

create or replace function public.set_user_api_key(
  provider_in  text,
  plaintext_key text
)
returns void
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  uid uuid := auth.uid();
  existing_secret_id uuid;
  new_secret_id uuid;
  secret_name text;
begin
  if uid is null then
    raise exception 'must be authenticated';
  end if;
  if provider_in not in ('anthropic') then
    raise exception 'unsupported provider: %', provider_in;
  end if;
  if plaintext_key is null or btrim(plaintext_key) = '' then
    raise exception 'plaintext_key cannot be empty';
  end if;

  secret_name := format('user_%s_%s', uid, provider_in);

  select secret_id into existing_secret_id
  from public.user_api_keys
  where user_id = uid and provider = provider_in;

  if existing_secret_id is not null then
    perform vault.update_secret(existing_secret_id, plaintext_key);
    update public.user_api_keys
    set updated_at = now()
    where user_id = uid and provider = provider_in;
  else
    new_secret_id := vault.create_secret(plaintext_key, secret_name);
    insert into public.user_api_keys (user_id, provider, secret_id)
    values (uid, provider_in, new_secret_id);
  end if;
end;
$$;

revoke all on function public.set_user_api_key(text, text) from public;
grant execute on function public.set_user_api_key(text, text) to authenticated;

-- ─── get_user_api_key ────────────────────────────────────────────────────────
-- Returns the plaintext key for the caller + provider, or null if unset.
-- Called by the `extract` Edge Function with the user's JWT context.

create or replace function public.get_user_api_key(
  provider_in text
)
returns text
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  uid uuid := auth.uid();
  s_id uuid;
  plaintext text;
begin
  if uid is null then
    raise exception 'must be authenticated';
  end if;

  select secret_id into s_id
  from public.user_api_keys
  where user_id = uid and provider = provider_in;

  if s_id is null then
    return null;
  end if;

  select decrypted_secret into plaintext
  from vault.decrypted_secrets
  where id = s_id;

  return plaintext;
end;
$$;

revoke all on function public.get_user_api_key(text) from public;
grant execute on function public.get_user_api_key(text) to authenticated;

-- ─── mark_user_api_key_validated ─────────────────────────────────────────────
-- Stamps last_validated_at after a successful test call. Separate from
-- set_user_api_key so a save without validation doesn't lie about validity.

create or replace function public.mark_user_api_key_validated(
  provider_in text
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ts timestamptz := now();
begin
  if uid is null then
    raise exception 'must be authenticated';
  end if;

  update public.user_api_keys
  set last_validated_at = ts, updated_at = ts
  where user_id = uid and provider = provider_in;

  return ts;
end;
$$;

revoke all on function public.mark_user_api_key_validated(text) from public;
grant execute on function public.mark_user_api_key_validated(text) to authenticated;

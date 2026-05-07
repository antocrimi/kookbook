-- Companion to set_user_api_key / get_user_api_key from migration
-- 20260506161259. Lets a user remove their stored API key from /settings —
-- deletes the vault.secrets entry and the user_api_keys row in one
-- transaction so the row never references a dangling secret.
--
-- Why a separate RPC (instead of direct DELETE via PostgREST)? Vault
-- objects live in the vault schema and aren't directly modifiable by the
-- authenticated role. A SECURITY DEFINER function with auth.uid() check
-- gives the user exactly one capability — delete their own key — without
-- broader vault permissions.
--
-- Risk #6 in PRD 04 "Security risks & mitigations": affords incident-
-- response rotation when a user suspects their key has leaked.

create or replace function public.delete_user_api_key(
  provider_in text
)
returns void
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  uid uuid := auth.uid();
  s_id uuid;
begin
  if uid is null then
    raise exception 'must be authenticated';
  end if;

  select secret_id into s_id
  from public.user_api_keys
  where user_id = uid and provider = provider_in;

  if s_id is null then
    return;
  end if;

  delete from public.user_api_keys
  where user_id = uid and provider = provider_in;

  delete from vault.secrets where id = s_id;
end;
$$;

revoke all on function public.delete_user_api_key(text) from public;
grant execute on function public.delete_user_api_key(text) to authenticated;

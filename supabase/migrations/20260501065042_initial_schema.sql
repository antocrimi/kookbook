-- Initial schema for cuckoobook.
-- Tables follow docs/prd/01-data-model.md and docs/prd/04-llm-integration.md.
-- All user-data tables enable RLS and scope by auth.uid().

set search_path = public;

-- ─── helpers ──────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── folders ──────────────────────────────────────────────────────────────────

create table public.folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  is_inbox    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index folders_user_id_idx on public.folders(user_id);
create unique index folders_user_name_unique
  on public.folders(user_id, lower(name));

create trigger folders_set_updated_at
  before update on public.folders
  for each row execute function public.set_updated_at();

-- One Inbox folder per user, automatically.
create unique index folders_one_inbox_per_user
  on public.folders(user_id)
  where is_inbox;

-- ─── tags ─────────────────────────────────────────────────────────────────────

create table public.tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create index tags_user_id_idx on public.tags(user_id);
create unique index tags_user_name_unique
  on public.tags(user_id, lower(name));

-- ─── recipes ──────────────────────────────────────────────────────────────────

create table public.recipes (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  folder_id            uuid not null references public.folders(id) on delete restrict,
  title                text not null,
  source               text,
  notes                text,
  default_servings     integer not null check (default_servings > 0),
  ingredients          jsonb not null default '[]'::jsonb,
  steps                jsonb not null default '[]'::jsonb,
  original_photo_path  text,
  is_draft             boolean not null default false,
  extracted_at         timestamptz,
  extraction_model     text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index recipes_user_folder_updated_idx
  on public.recipes(user_id, folder_id, updated_at desc);
create index recipes_user_title_idx on public.recipes(user_id, lower(title));

create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

-- Folder must belong to the same user as the recipe.
create or replace function public.recipes_check_folder_ownership()
returns trigger
language plpgsql
as $$
declare
  folder_owner uuid;
begin
  select user_id into folder_owner from public.folders where id = new.folder_id;
  if folder_owner is null or folder_owner <> new.user_id then
    raise exception 'folder does not belong to the recipe owner';
  end if;
  return new;
end;
$$;

create trigger recipes_check_folder_ownership_trg
  before insert or update of folder_id, user_id on public.recipes
  for each row execute function public.recipes_check_folder_ownership();

-- ─── recipe_tags (join) ───────────────────────────────────────────────────────

create table public.recipe_tags (
  recipe_id  uuid not null references public.recipes(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

create index recipe_tags_tag_idx on public.recipe_tags(tag_id);

-- ─── user_api_keys ────────────────────────────────────────────────────────────
-- Per docs/prd/04-llm-integration.md. The `secret_id` references Supabase Vault.
-- For local dev convenience the column is nullable so we can develop without Vault
-- and swap it in later. RLS still scopes rows to the owner.

create table public.user_api_keys (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  provider             text not null check (provider in ('anthropic')),
  secret_id            uuid,
  last_validated_at    timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id, provider)
);

create trigger user_api_keys_set_updated_at
  before update on public.user_api_keys
  for each row execute function public.set_updated_at();

-- ─── extraction_logs ──────────────────────────────────────────────────────────

create table public.extraction_logs (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  recipe_id                uuid references public.recipes(id) on delete set null,
  model                    text not null,
  input_tokens             integer not null default 0,
  output_tokens            integer not null default 0,
  cache_read_tokens        integer not null default 0,
  cache_creation_tokens    integer not null default 0,
  duration_ms              integer not null default 0,
  status                   text not null check (status in ('success', 'error')),
  error_code               text,
  created_at               timestamptz not null default now()
);

create index extraction_logs_user_created_idx
  on public.extraction_logs(user_id, created_at desc);

-- ─── user_preferences ─────────────────────────────────────────────────────────
-- Used by docs/prd/05-auth-and-onboarding.md (units, default_model).

create table public.user_preferences (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  units            text not null default 'metric' check (units in ('metric', 'imperial')),
  default_model    text not null default 'claude-sonnet-4-6',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- Seed Inbox folder + default user_preferences on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.folders(user_id, name, is_inbox)
  values (new.id, 'Inbox', true);
  insert into public.user_preferences(user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Row-level security ───────────────────────────────────────────────────────

alter table public.folders            enable row level security;
alter table public.tags               enable row level security;
alter table public.recipes            enable row level security;
alter table public.recipe_tags        enable row level security;
alter table public.user_api_keys      enable row level security;
alter table public.extraction_logs    enable row level security;
alter table public.user_preferences   enable row level security;

create policy folders_owner_all on public.folders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy tags_owner_all on public.tags
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy recipes_owner_all on public.recipes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- recipe_tags: access mediated via the recipe's owner.
create policy recipe_tags_owner_all on public.recipe_tags
  for all using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_tags.recipe_id and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_tags.recipe_id and r.user_id = auth.uid()
    )
  );

create policy user_api_keys_owner_all on public.user_api_keys
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- extraction_logs: owner can read; inserts come from the service role only.
create policy extraction_logs_owner_select on public.extraction_logs
  for select using (user_id = auth.uid());

create policy user_preferences_owner_all on public.user_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── Storage bucket: recipe-photos ────────────────────────────────────────────
-- Each user reads/writes only under {user_id}/ prefix.

insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', false)
on conflict (id) do nothing;

create policy "recipe-photos owner read"
  on storage.objects for select
  using (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "recipe-photos owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "recipe-photos owner update"
  on storage.objects for update
  using (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "recipe-photos owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

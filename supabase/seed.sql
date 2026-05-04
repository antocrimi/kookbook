-- Local-dev seed: two fixed accounts for cuckoobook.
-- Re-runnable via `supabase db reset`. Both users authenticate with
-- email + password (magic link is disabled). Default password is
-- 'cuckoobook' — change it from /settings after signing in.

-- The handle_new_user() trigger on auth.users will create an Inbox
-- folder and default user_preferences row for each user.

with new_users as (
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values
    (
      '00000000-0000-0000-0000-000000000000',
      '11111111-1111-1111-1111-111111111111',
      'authenticated',
      'authenticated',
      'anto@cuckoobook.com',
      extensions.crypt('cuckoobook', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      '22222222-2222-2222-2222-222222222222',
      'authenticated',
      'authenticated',
      'kaz@cuckoobook.com',
      extensions.crypt('cuckoobook', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
  on conflict (id) do nothing
  returning id, email
)
insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  id::text,
  id,
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from new_users
on conflict do nothing;

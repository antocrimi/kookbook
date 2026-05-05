-- Adds two display fields the prototype design carries that the initial
-- schema didn't: total/active cook time (minutes) and a one-paragraph
-- editorial description shown above ingredients on the recipe detail page.
--
-- Both nullable: AI extraction may not produce them, and existing rows
-- predate this column.

alter table public.recipes
  add column if not exists time_min integer,
  add column if not exists description text;

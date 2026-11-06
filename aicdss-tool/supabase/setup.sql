-- AI-CDSS Transparency Assessment Tool: database setup
-- Run this in Supabase (it is safe to run more than once): Dashboard > SQL Editor > New query > paste > Run.
-- User accounts are handled by Supabase Auth (auth.users). No patient data is stored.

create table if not exists public.assessments (
  assessment_id    uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  institution_name text not null,
  ai_cdss_name     text not null,
  vendor           text,
  intended_use     text,
  stage            text not null check (stage in ('pre-adoption', 'in-use')),
  status           text not null default 'in progress' check (status in ('in progress', 'completed')),
  gaps_identified  int,
  created_at       timestamptz not null default now(),
  completed_at     timestamptz
);

create table if not exists public.answers (
  answer_id     uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (assessment_id) on delete cascade,
  question_id   text not null,
  response      text not null check (response in ('Yes', 'No', 'I do not know')),
  is_gap        boolean not null,
  unique (assessment_id, question_id)
);

-- Row Level Security: each user can only see and change their own records
alter table public.assessments enable row level security;
alter table public.answers     enable row level security;

drop policy if exists "Users manage their own assessments" on public.assessments;
create policy "Users manage their own assessments"
  on public.assessments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage answers to their own assessments" on public.answers;
create policy "Users manage answers to their own assessments"
  on public.answers for all
  using (exists (select 1 from public.assessments a
                 where a.assessment_id = answers.assessment_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.assessments a
                      where a.assessment_id = answers.assessment_id and a.user_id = auth.uid()));

-- Allow logged-in users to use the tables through the Data API
-- (newer Supabase projects do not grant this automatically).
-- Row Level Security above still limits each user to their own rows.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.assessments to authenticated;
grant select, insert, update, delete on public.answers to authenticated;

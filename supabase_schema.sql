-- ============================================================
--  Arête OS — Supabase Schema & RLS
--  Run this once in the Supabase SQL editor for your project.
--  URL: https://xgvvqrjxxyjtauvxufej.supabase.co
-- ============================================================

-- ── 1. GOALS ─────────────────────────────────────────────────
create table if not exists goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  category    text,
  target      text,
  progress    int  default 0,
  status      text default 'Active',
  notes       text default '',
  subtasks    jsonb default '[]'::jsonb,
  created_at  timestamptz default now()
);
alter table goals enable row level security;
create policy "goals: own rows" on goals
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 2. TASKS ─────────────────────────────────────────────────
create table if not exists tasks (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  title              text not null,
  priority           text default 'medium',
  goal_id            uuid references goals(id) on delete set null,
  linked_subtask_id  text,
  due_date           date,
  completed          boolean default false,
  completed_at       timestamptz,
  source             text default 'manual',
  created_at         timestamptz default now()
);
alter table tasks enable row level security;
create policy "tasks: own rows" on tasks
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. NOTES ─────────────────────────────────────────────────
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text default '',
  content     text,
  tags        jsonb default '[]'::jsonb,
  source      text default 'manual',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table notes enable row level security;
create policy "notes: own rows" on notes
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 4. DISCIPLINES (habit definitions) ───────────────────────
create table if not exists disciplines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  icon        text default '✦',
  category    text,
  target_days text default 'daily',
  sort_order  int  default 0,
  created_at  timestamptz default now()
);
alter table disciplines enable row level security;
create policy "disciplines: own rows" on disciplines
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 5. DISCIPLINE LOGS (per-day completions) ─────────────────
create table if not exists discipline_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  discipline_id uuid not null references disciplines(id) on delete cascade,
  log_date      date not null,
  completed     boolean default false,
  created_at    timestamptz default now(),
  unique (user_id, discipline_id, log_date)
);
alter table discipline_logs enable row level security;
create policy "discipline_logs: own rows" on discipline_logs
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 6. JOURNAL ENTRIES ────────────────────────────────────────
create table if not exists journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entry_date  date not null,
  intensity   int,
  victories   text default '',
  lessons     text default '',
  tomorrow    text default '',
  reflection  text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, entry_date)
);
alter table journal_entries enable row level security;
create policy "journal_entries: own rows" on journal_entries
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 7. SCHEDULE EVENTS ───────────────────────────────────────
create table if not exists schedule_events (
  id          text primary key,           -- ev_N format preserved
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  category    text,
  start_time  timestamptz,
  duration    int,                        -- minutes
  recurring   text default 'none',
  created_at  timestamptz default now()
);
alter table schedule_events enable row level security;
create policy "schedule_events: own rows" on schedule_events
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 8. BOOKS ─────────────────────────────────────────────────
create table if not exists books (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  author      text default '',
  status      text default 'QUEUED',      -- QUEUED | READING | COMPLETED
  total_pages int  default 0,
  pages_read  int  default 0,
  rating      int,
  notes       text default '',
  started_at  timestamptz,
  finished_at timestamptz,
  created_at  timestamptz default now()
);
alter table books enable row level security;
create policy "books: own rows" on books
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 9. BODY STATS ────────────────────────────────────────────
create table if not exists body_stats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  stat_date   date not null,
  weight      numeric(5,1),
  protein     int  default 0,
  feel        int,
  gym_done    boolean default false,
  notes       text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, stat_date)
);
alter table body_stats enable row level security;
create policy "body_stats: own rows" on body_stats
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 10. STICKY NOTES ─────────────────────────────────────────
create table if not exists sticky_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  priority    text default 'mid',         -- high | mid | low
  title       text default '',
  body        text default '',
  pinned      boolean default false,
  tags        jsonb default '[]'::jsonb,
  sort_order  int  default 0,
  created_at  timestamptz default now()
);
alter table sticky_notes enable row level security;
create policy "sticky_notes: own rows" on sticky_notes
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 11. PLANNER ENTRIES ──────────────────────────────────────
create table if not exists planner_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  plan_date        date not null,
  intentions       jsonb default '[]'::jsonb,
  objective        text default '',
  obstacles        text default '',
  non_negotiables  text default '',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, plan_date)
);
alter table planner_entries enable row level security;
create policy "planner_entries: own rows" on planner_entries
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

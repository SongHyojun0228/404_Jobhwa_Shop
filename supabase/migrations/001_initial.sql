-- 개발자의 잡화점 — 초기 스키마

-- ─── worries (고민) ───
create table worries (
  id           uuid primary key default gen_random_uuid(),
  display_type text not null check (display_type in ('anonymous','nickname','initials')),
  display_name text,
  age_group    text,
  job          text,
  content      text not null,
  email        text,
  status       text not null default 'pending'
                 check (status in ('pending','selected','published','closed','completed')),
  created_at   timestamptz not null default now(),
  selected_at  timestamptz,
  published_at timestamptz,
  closed_at    timestamptz,
  completed_at timestamptz
);

-- ─── solutions (해결편지) ───
create table solutions (
  id           uuid primary key default gen_random_uuid(),
  worry_id     uuid not null references worries(id) on delete cascade,
  display_type text not null check (display_type in ('anonymous','nickname','initials')),
  display_name text,
  content      text not null,
  is_picked    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_solutions_worry_id on solutions(worry_id);

-- ─── RLS ───
alter table worries  enable row level security;
alter table solutions enable row level security;

-- anon INSERT 허용 (공개 제출)
create policy "anon can insert worries"
  on worries for insert
  to anon
  with check (true);

create policy "anon can insert solutions"
  on solutions for insert
  to anon
  with check (true);

-- anon SELECT: published 고민만 (solve 페이지용)
create policy "anon can read published worries"
  on worries for select
  to anon
  using (status = 'published');

-- service_role은 RLS 우회하므로 별도 정책 불필요

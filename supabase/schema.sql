-- =====================================================================
-- TILIK — Ajar Sesuai Tingkat
-- Diagnostik literasi & numerasi dasar untuk pembelajaran sesuai tingkat
-- kemampuan (Teaching at the Right Level) di SD kelas 3–6.
-- Jalankan SEKALI di Supabase > SQL Editor.
-- =====================================================================
create extension if not exists "pgcrypto";

-- Sekolah
create table public.schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Akun guru & kepala sekolah (terhubung ke auth.users Supabase)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in ('teacher','admin')),
  school_id   uuid not null references public.schools(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Kelas
create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,
  grade       smallint not null check (grade between 1 and 6),
  teacher_id  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Siswa (tidak perlu akun; dites oleh guru)
create table public.students (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  full_name   text not null check (char_length(full_name) <= 100),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index students_class_idx on public.students (class_id);

-- Putaran tes (misalnya: Awal, Putaran 2, ...). Tes ulang dianjurkan tiap ±2 minggu.
create table public.rounds (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,
  started_on  date not null default current_date,
  created_at  timestamptz not null default now()
);
create index rounds_school_idx on public.rounds (school_id, started_on desc);

-- Hasil tes diagnostik: satu hasil per siswa, per mata uji, per putaran
create table public.assessments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  round_id     uuid not null references public.rounds(id) on delete cascade,
  subject      text not null check (subject in ('literasi','numerasi')),
  level        smallint not null check (level between 1 and 5),
  assessed_by  uuid references public.profiles(id) on delete set null,
  assessed_on  date not null default current_date,
  note         text check (char_length(note) <= 300),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (student_id, round_id, subject)
);
create index assessments_student_idx on public.assessments (student_id);

-- ---------------------------------------------------------------------
-- Keamanan: RLS aktif tanpa policy = akses langsung dari browser DITOLAK.
-- Semua akses lewat backend Express (service role key).
-- ---------------------------------------------------------------------
alter table public.schools     enable row level security;
alter table public.profiles    enable row level security;
alter table public.classes     enable row level security;
alter table public.students    enable row level security;
alter table public.rounds      enable row level security;
alter table public.assessments enable row level security;

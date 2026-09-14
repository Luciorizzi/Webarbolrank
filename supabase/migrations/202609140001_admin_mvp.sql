create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- El panel usa service_role exclusivamente en el servidor, después de validar
-- la sesión y la membresía. Ningún rol de navegador accede a esta tabla.
revoke all on public.admin_users from anon, authenticated;


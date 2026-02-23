-- Create the junction table
create table if not exists public.recruiter_companies (
    recruiter_id uuid not null references public.users(id) on delete cascade,
    company_id uuid not null references public.companies(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (recruiter_id, company_id)
);

-- Enable RLS
alter table public.recruiter_companies enable row level security;

-- Add RLS policies
create policy "Admins can do everything on recruiter_companies" 
    on public.recruiter_companies
    for all 
    using (public.is_admin());

create policy "Users can view their own companies" 
    on public.recruiter_companies
    for select 
    using (auth.uid() = recruiter_id);

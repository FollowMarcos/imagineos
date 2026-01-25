-- Create prompts table
create table prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  positive_prompt text,
  negative_prompt text,
  images text[] default '{}',
  models text[] default '{}',
  aspect_ratios text[] default '{}',
  tags text[] default '{}',
  content_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create prompt_shares table
create table prompt_shares (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references prompts(id) on delete cascade not null,
  shared_by_user_id uuid references auth.users not null,
  shared_with_user_id uuid references auth.users not null,
  is_accepted boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table prompts enable row level security;
alter table prompt_shares enable row level security;

-- Policies for prompts
create policy "Users can view and edit their own prompts"
  on prompts for all
  using (auth.uid() = user_id);

create policy "Users can view prompts shared with them"
  on prompts for select
  using (
    exists (
      select 1 from prompt_shares
      where prompt_shares.prompt_id = prompts.id
      and prompt_shares.shared_with_user_id = auth.uid()
    )
  );

-- Policies for prompt_shares
create policy "Users can see shares they sent or received"
  on prompt_shares for select
  using (
    auth.uid() = shared_by_user_id or 
    auth.uid() = shared_with_user_id
  );

create policy "Users can create shares"
  on prompt_shares for insert
  with check (auth.uid() = shared_by_user_id);

create policy "Users can delete their own shares (Unshare or Remove)"
  on prompt_shares for delete
  using (
    auth.uid() = shared_by_user_id or 
    auth.uid() = shared_with_user_id
  );

-- Indexes for performance
create index idx_prompts_user_id on prompts(user_id);
create index idx_prompt_shares_prompt_id on prompt_shares(prompt_id);
create index idx_prompt_shares_shared_with on prompt_shares(shared_with_user_id);
create index idx_prompt_shares_shared_by on prompt_shares(shared_by_user_id);

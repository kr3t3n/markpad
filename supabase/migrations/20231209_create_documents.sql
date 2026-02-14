-- Create index on user_id for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_documents_updated_at
    before update on documents
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security
alter table documents enable row level security;

-- Create policies
create policy "Users can create their own documents"
    on documents for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own documents"
    on documents for select
    using (auth.uid() = user_id);

create policy "Users can update their own documents"
    on documents for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
    on documents for delete
    using (auth.uid() = user_id);

alter table if exists auth.email_verifications
  add column if not exists extend_window_start timestamptz,
  add column if not exists extend_window_count integer default 0 not null;

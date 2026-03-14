-- Reset auth tables for signup testing
TRUNCATE TABLE auth.email_verifications,
               auth.refresh_tokens,
               auth.users
RESTART IDENTITY;

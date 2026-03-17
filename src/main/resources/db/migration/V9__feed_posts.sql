create schema if not exists feed;

create table if not exists feed.feed_posts (
    id bigserial primary key,
    user_id bigint not null,
    content text,
    image_url text,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index if not exists idx_feed_posts_user_id on feed.feed_posts (user_id);
create index if not exists idx_feed_posts_created_at on feed.feed_posts (created_at desc);

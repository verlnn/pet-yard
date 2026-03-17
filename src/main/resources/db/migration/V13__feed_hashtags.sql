create table if not exists feed.hashtags (
    id bigserial primary key,
    name varchar(50) not null unique,
    created_at timestamptz not null default now()
);

create table if not exists feed.feed_post_hashtags (
    id bigserial primary key,
    post_id bigint not null references feed.feed_posts(id) on delete cascade,
    hashtag_id bigint not null references feed.hashtags(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (post_id, hashtag_id)
);

create index if not exists idx_feed_post_hashtags_post_id on feed.feed_post_hashtags (post_id);
create index if not exists idx_feed_post_hashtags_hashtag_id on feed.feed_post_hashtags (hashtag_id);

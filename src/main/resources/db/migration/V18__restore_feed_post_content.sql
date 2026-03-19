alter table if exists feed.feed_posts
    add column if not exists content text;

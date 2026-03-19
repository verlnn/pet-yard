alter table if exists feed.feed_post_images
    add column if not exists content text;

alter table if exists feed.feed_posts
    drop column if exists content;

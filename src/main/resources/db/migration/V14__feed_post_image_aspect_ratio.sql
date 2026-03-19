alter table if exists feed.feed_posts
    add column if not exists image_aspect_ratio varchar(10);

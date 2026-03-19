create table if not exists feed.feed_post_images (
    id bigserial primary key,
    post_id bigint not null references feed.feed_posts(id) on delete cascade,
    image_url text not null,
    image_aspect_ratio_value double precision,
    image_aspect_ratio varchar(10),
    sort_order integer not null,
    created_at timestamptz not null
);

create index if not exists idx_feed_post_images_post_id on feed.feed_post_images (post_id);
create index if not exists idx_feed_post_images_sort_order on feed.feed_post_images (post_id, sort_order);

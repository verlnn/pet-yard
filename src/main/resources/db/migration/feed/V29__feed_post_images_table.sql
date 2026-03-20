create table if not exists feed.feed_post_images (
  id bigserial primary key,
  post_id bigint not null references feed.feed_posts(id) on delete cascade,
  image_url text not null,
  content text,
  image_aspect_ratio_value double precision,
  image_aspect_ratio varchar(10),
  sort_order integer not null,
  created_at timestamptz not null
);

create index if not exists idx_feed_post_images_post_id on feed.feed_post_images (post_id);
create index if not exists idx_feed_post_images_sort_order on feed.feed_post_images (post_id, sort_order);

comment on table feed.feed_post_images is '피드 게시물 이미지 정보';
comment on column feed.feed_post_images.id is '게시물 이미지 식별자';
comment on column feed.feed_post_images.post_id is '피드 게시물 식별자';
comment on column feed.feed_post_images.image_url is '저장된 이미지 URL';
comment on column feed.feed_post_images.content is '이미지 원본 파일명 또는 설명';
comment on column feed.feed_post_images.image_aspect_ratio_value is '이미지 비율 실수값';
comment on column feed.feed_post_images.image_aspect_ratio is '이미지 비율 코드';
comment on column feed.feed_post_images.sort_order is '게시물 내 이미지 순서';
comment on column feed.feed_post_images.created_at is '생성 시각';

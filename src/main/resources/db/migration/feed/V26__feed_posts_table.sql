create table if not exists feed.feed_posts (
  id bigserial primary key,
  user_id bigint not null,
  content text,
  image_aspect_ratio_value double precision,
  image_aspect_ratio varchar(10),
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists idx_feed_posts_user_id on feed.feed_posts (user_id);
create index if not exists idx_feed_posts_created_at on feed.feed_posts (created_at desc);

comment on table feed.feed_posts is '피드 게시물 기본 정보';
comment on column feed.feed_posts.id is '피드 게시물 식별자';
comment on column feed.feed_posts.user_id is '작성자 회원 식별자';
comment on column feed.feed_posts.content is '게시물 본문';
comment on column feed.feed_posts.image_aspect_ratio_value is '대표 이미지 비율 실수값';
comment on column feed.feed_posts.image_aspect_ratio is '대표 이미지 비율 코드';
comment on column feed.feed_posts.created_at is '생성 시각';
comment on column feed.feed_posts.updated_at is '수정 시각';

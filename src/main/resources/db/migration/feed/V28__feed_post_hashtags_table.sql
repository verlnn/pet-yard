create table if not exists feed.feed_post_hashtags (
  id bigserial primary key,
  post_id bigint not null references feed.feed_posts(id) on delete cascade,
  hashtag_id bigint not null references feed.hashtags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, hashtag_id)
);

create index if not exists idx_feed_post_hashtags_post_id on feed.feed_post_hashtags (post_id);
create index if not exists idx_feed_post_hashtags_hashtag_id on feed.feed_post_hashtags (hashtag_id);

comment on table feed.feed_post_hashtags is '피드 게시물과 해시태그 연결 정보';
comment on column feed.feed_post_hashtags.id is '게시물 해시태그 연결 식별자';
comment on column feed.feed_post_hashtags.post_id is '피드 게시물 식별자';
comment on column feed.feed_post_hashtags.hashtag_id is '해시태그 식별자';
comment on column feed.feed_post_hashtags.created_at is '생성 시각';

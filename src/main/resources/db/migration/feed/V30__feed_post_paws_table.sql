create table if not exists feed.feed_post_paws (
  id bigserial primary key,
  post_id bigint not null references feed.feed_posts(id) on delete cascade,
  user_id bigint not null,
  created_at timestamptz not null default now(),
  constraint uq_feed_post_paws_post_user unique (post_id, user_id)
);

create index if not exists idx_feed_post_paws_post_id on feed.feed_post_paws (post_id);
create index if not exists idx_feed_post_paws_user_id on feed.feed_post_paws (user_id);

comment on table feed.feed_post_paws is '피드 게시물 발자국 반응 정보';
comment on column feed.feed_post_paws.id is '발자국 반응 식별자';
comment on column feed.feed_post_paws.post_id is '피드 게시물 식별자';
comment on column feed.feed_post_paws.user_id is '반응한 회원 식별자';
comment on column feed.feed_post_paws.created_at is '생성 시각';

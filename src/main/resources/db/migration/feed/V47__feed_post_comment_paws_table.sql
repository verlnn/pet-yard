create table if not exists feed.feed_post_comment_paws (
    id bigserial primary key,
    comment_id bigint not null references feed.feed_post_comments(id) on delete cascade,
    user_id bigint not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    constraint uq_feed_post_comment_paws_comment_user unique (comment_id, user_id)
);

create index if not exists idx_feed_post_comment_paws_comment_id
    on feed.feed_post_comment_paws (comment_id);

create index if not exists idx_feed_post_comment_paws_user_id
    on feed.feed_post_comment_paws (user_id);

comment on table feed.feed_post_comment_paws is '피드 댓글 발자국 반응 정보';
comment on column feed.feed_post_comment_paws.comment_id is '피드 댓글 식별자';
comment on column feed.feed_post_comment_paws.user_id is '반응한 회원 식별자';
comment on column feed.feed_post_comment_paws.created_at is '생성 시각';

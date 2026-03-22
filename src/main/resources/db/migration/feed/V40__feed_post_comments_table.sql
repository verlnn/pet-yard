create table feed.feed_post_comments (
    id bigserial primary key,
    post_id bigint not null references feed.feed_posts(id) on delete cascade,
    user_id bigint not null references auth.users(id) on delete cascade,
    content varchar(300) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_feed_post_comments_post_created_id
    on feed.feed_post_comments (post_id, created_at asc, id asc);

create index idx_feed_post_comments_user_created
    on feed.feed_post_comments (user_id, created_at desc);

comment on table feed.feed_post_comments is '피드 게시물 댓글 정보';
comment on column feed.feed_post_comments.id is '댓글 식별자';
comment on column feed.feed_post_comments.post_id is '피드 게시물 식별자';
comment on column feed.feed_post_comments.user_id is '댓글 작성 회원 식별자';
comment on column feed.feed_post_comments.content is '댓글 본문';
comment on column feed.feed_post_comments.created_at is '생성 시각';
comment on column feed.feed_post_comments.updated_at is '수정 시각';

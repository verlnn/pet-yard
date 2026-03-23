alter table feed.feed_post_comments
    add column if not exists parent_comment_id bigint references feed.feed_post_comments(id) on delete cascade;

create index if not exists idx_feed_post_comments_parent_created_id
    on feed.feed_post_comments (parent_comment_id, created_at asc, id asc);

comment on column feed.feed_post_comments.parent_comment_id is '부모 댓글 식별자';

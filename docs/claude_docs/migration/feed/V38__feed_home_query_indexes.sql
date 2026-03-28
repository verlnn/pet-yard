create index if not exists idx_feed_posts_created_at_id_desc
  on feed.feed_posts (created_at desc, id desc);

create index if not exists idx_feed_post_paws_user_id_post_id
  on feed.feed_post_paws (user_id, post_id);

comment on index feed.idx_feed_posts_created_at_id_desc is
  '홈 피드 최신순 정렬과 커서(created_at, id) 조회를 위한 복합 인덱스';

comment on index feed.idx_feed_post_paws_user_id_post_id is
  '회원별 좋아요 여부 조회(user_id + post_id in ...)를 위한 복합 인덱스';

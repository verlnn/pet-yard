create table if not exists feed.hashtags (
  id bigserial primary key,
  name varchar(50) not null unique,
  created_at timestamptz not null default now()
);

comment on table feed.hashtags is '피드 해시태그 마스터';
comment on column feed.hashtags.id is '해시태그 식별자';
comment on column feed.hashtags.name is '해시태그명';
comment on column feed.hashtags.created_at is '생성 시각';

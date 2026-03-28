create table if not exists auth.terms (
  id bigserial primary key,
  code varchar(40) not null,
  version integer not null,
  title varchar(200) not null,
  mandatory boolean not null default true,
  content_url varchar(512),
  created_at timestamptz not null default now()
);

create unique index if not exists uk_terms_code_version
  on auth.terms (code, version);

comment on table auth.terms is '약관 마스터 정보';
comment on column auth.terms.id is '약관 식별자';
comment on column auth.terms.code is '약관 코드';
comment on column auth.terms.version is '약관 버전';
comment on column auth.terms.title is '약관 제목';
comment on column auth.terms.mandatory is '필수 약관 여부';
comment on column auth.terms.content_url is '약관 전문 URL';
comment on column auth.terms.created_at is '생성 시각';

create table if not exists auth.terms_agreements (
  id bigserial primary key,
  user_id bigint not null references auth.users(id),
  terms_id bigint not null references auth.terms(id),
  agreed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists uk_terms_agreements
  on auth.terms_agreements (user_id, terms_id);

comment on table auth.terms_agreements is '회원 약관 동의 이력';
comment on column auth.terms_agreements.id is '약관 동의 식별자';
comment on column auth.terms_agreements.user_id is '회원 식별자';
comment on column auth.terms_agreements.terms_id is '약관 식별자';
comment on column auth.terms_agreements.agreed_at is '동의 시각';
comment on column auth.terms_agreements.created_at is '생성 시각';

create table if not exists pet.breeds (
  id bigserial primary key,
  species varchar(16) not null,
  name_ko varchar(120) not null,
  name_en varchar(120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pet_breeds_species on pet.breeds(species);

comment on table pet.breeds is '반려동물 품종 마스터 정보';
comment on column pet.breeds.id is '품종 식별자';
comment on column pet.breeds.species is '축종';
comment on column pet.breeds.name_ko is '품종 한글명';
comment on column pet.breeds.name_en is '품종 영문명';
comment on column pet.breeds.created_at is '생성 시각';
comment on column pet.breeds.updated_at is '수정 시각';

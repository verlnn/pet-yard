create table if not exists pet.pet_profiles (
  id bigserial primary key,
  user_id bigint not null references auth.users(id),
  name varchar(40) not null,
  species varchar(20) not null,
  breed varchar(60),
  birth_date date,
  age_group varchar(20),
  gender varchar(10) not null,
  neutered boolean,
  intro varchar(500),
  photo_url text,
  weight_kg numeric(5, 2),
  vaccination_complete boolean,
  walk_safety_checked boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pet_profiles_user on pet.pet_profiles (user_id);

comment on table pet.pet_profiles is '반려동물 프로필 정보';
comment on column pet.pet_profiles.id is '반려동물 식별자';
comment on column pet.pet_profiles.user_id is '보호자 회원 식별자';
comment on column pet.pet_profiles.name is '반려동물 이름';
comment on column pet.pet_profiles.species is '축종';
comment on column pet.pet_profiles.breed is '품종명';
comment on column pet.pet_profiles.birth_date is '생년월일';
comment on column pet.pet_profiles.age_group is '연령대';
comment on column pet.pet_profiles.gender is '성별';
comment on column pet.pet_profiles.neutered is '중성화 여부';
comment on column pet.pet_profiles.intro is '소개글';
comment on column pet.pet_profiles.photo_url is '사진 URL';
comment on column pet.pet_profiles.weight_kg is '몸무게(kg)';
comment on column pet.pet_profiles.vaccination_complete is '예방접종 완료 여부';
comment on column pet.pet_profiles.walk_safety_checked is '산책 안전수칙 확인 여부';
comment on column pet.pet_profiles.created_at is '생성 시각';
comment on column pet.pet_profiles.updated_at is '수정 시각';

#!/usr/bin/env bash
set -euo pipefail

DB_URL="${1:-postgresql://localhost:5432/petyard}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

map_source_path() {
  local image_url="$1"
  if [[ "$image_url" == /upload/images/* ]]; then
    printf '%s/%s\n' "$PROJECT_ROOT" "${image_url#/}"
    return 0
  fi
  if [[ "$image_url" == /uploads/* ]]; then
    printf '%s/%s\n' "$PROJECT_ROOT" "${image_url#/}"
    return 0
  fi
  if [[ "$image_url" == /data/pet-yard/images/* ]]; then
    printf '%s\n' "$image_url"
    return 0
  fi
  return 1
}

build_target_url() {
  local user_id="$1"
  local image_url="$2"
  local filename
  filename="$(basename "$image_url")"

  if [[ "$image_url" == /upload/images/feed/* ]]; then
    printf '/upload/images/feed/%s/%s\n' "$user_id" "$filename"
    return 0
  fi
  if [[ "$image_url" == /uploads/feed/* ]]; then
    printf '/uploads/feed/%s/%s\n' "$user_id" "$filename"
    return 0
  fi
  if [[ "$image_url" == /data/pet-yard/images/feed/* ]]; then
    printf '/data/pet-yard/images/feed/%s/%s\n' "$user_id" "$filename"
    return 0
  fi
  return 1
}

echo "feed 이미지 사용자별 디렉토리 마이그레이션 시작"

while IFS='|' read -r user_id image_id image_url; do
  [[ -z "$user_id" || -z "$image_id" || -z "$image_url" ]] && continue

  source_path="$(map_source_path "$image_url")" || {
    echo "건너뜀: 지원하지 않는 image_url 형식 -> $image_url" >&2
    continue
  }
  target_url="$(build_target_url "$user_id" "$image_url")" || {
    echo "건너뜀: 대상 URL 생성 실패 -> $image_url" >&2
    continue
  }
  target_path="$(map_source_path "$target_url")"

  mkdir -p "$(dirname "$target_path")"

  if [[ -f "$source_path" && "$source_path" != "$target_path" ]]; then
    mv "$source_path" "$target_path"
    echo "이동: $source_path -> $target_path"
  elif [[ ! -f "$source_path" && -f "$target_path" ]]; then
    echo "이미 이동됨: $target_path"
  elif [[ ! -f "$source_path" ]]; then
    echo "경고: 원본 파일 없음 -> $source_path" >&2
  fi

  psql "$DB_URL" -v ON_ERROR_STOP=1 -c "
    update feed.feed_post_images
    set image_url = '${target_url}'
    where id = ${image_id};
  " >/dev/null
done < <(
  psql "$DB_URL" -At -F '|' -c "
    select fp.user_id, fpi.id, fpi.image_url
    from feed.feed_post_images fpi
    join feed.feed_posts fp on fp.id = fpi.post_id
    where fpi.image_url !~ '/feed/[0-9]+/'
    order by fp.user_id, fpi.id;
  "
)

echo "feed 이미지 사용자별 디렉토리 마이그레이션 완료"

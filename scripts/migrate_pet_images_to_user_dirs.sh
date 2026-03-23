#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DB_URL="${DB_URL:-postgresql://localhost:5432/petyard}"
UPLOAD_DIR="${UPLOAD_DIR:-$ROOT_DIR/upload/images}"
PUBLIC_URL_PREFIX="${PUBLIC_URL_PREFIX:-/upload/images}"

decode_base64() {
  if base64 --help >/dev/null 2>&1; then
    base64 --decode
  else
    base64 -D
  fi
}

extension_from_mime() {
  case "$1" in
    image/jpeg|image/jpg) printf 'jpg' ;;
    image/png) printf 'png' ;;
    image/webp) printf 'webp' ;;
    image/gif) printf 'gif' ;;
    *)
      printf ''
      ;;
  esac
}

echo "반려동물 이미지 마이그레이션 시작"
echo "DB_URL=$DB_URL"
echo "UPLOAD_DIR=$UPLOAD_DIR"
echo "PUBLIC_URL_PREFIX=$PUBLIC_URL_PREFIX"

mkdir -p "$UPLOAD_DIR/pets"

sql="
select
  id,
  user_id,
  encode(convert_to(photo_url, 'UTF8'), 'base64') as encoded_photo_url
from pet.pet_profiles
where photo_url like 'data:image/%;base64,%'
order by user_id, id
"

processed=0
query_output_file="$(mktemp)"
trap 'rm -f "$query_output_file"' EXIT

psql "$DB_URL" -At -F $'\t' -c "$sql" > "$query_output_file"

while IFS=$'\t' read -r pet_id user_id encoded_photo_url; do
  if [[ -z "${pet_id:-}" || -z "${user_id:-}" || -z "${encoded_photo_url:-}" ]]; then
    continue
  fi

  photo_url="$(printf '%s' "$encoded_photo_url" | decode_base64)"
  mime_type="${photo_url#data:}"
  mime_type="${mime_type%%;base64,*}"
  payload="${photo_url#*,}"
  extension="$(extension_from_mime "$mime_type")"

  if [[ -z "$extension" ]]; then
    echo "건너뜀: pet_id=$pet_id user_id=$user_id unsupported mime_type=$mime_type"
    continue
  fi

  filename="${pet_id}-$(uuidgen | tr '[:upper:]' '[:lower:]').${extension}"
  relative_path="pets/${user_id}/${filename}"
  absolute_path="${UPLOAD_DIR}/${relative_path}"
  public_url="${PUBLIC_URL_PREFIX}/${relative_path}"

  mkdir -p "$(dirname "$absolute_path")"
  printf '%s' "$payload" | decode_base64 > "$absolute_path"

  psql "$DB_URL" -v ON_ERROR_STOP=1 -c \
    "update pet.pet_profiles set photo_url = '${public_url}' where id = ${pet_id};" >/dev/null

  processed=$((processed + 1))
  echo "변환 완료: pet_id=$pet_id user_id=$user_id -> $public_url"
done < "$query_output_file"

echo "반려동물 이미지 마이그레이션 완료: ${processed}건"

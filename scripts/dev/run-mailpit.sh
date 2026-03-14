#!/usr/bin/env bash
set -euo pipefail

# --- 설정 ---
CONTAINER_NAME="mailpit"
SMTP_PORT="1025"
WEB_PORT="8025"
IMAGE="axllent/mailpit"

# --- Docker 데몬 실행 여부 확인 ---
# (Docker Desktop을 켜주진 않으며, Docker 접속 가능 여부만 확인합니다.)
if ! docker info >/dev/null 2>&1; then
  echo "[error] Docker is not running. Please start Docker Desktop and retry."
  exit 1
fi

# --- 최신 이미지 받기 (선택 사항) ---
# 항상 최신 이미지를 받고 싶다면 아래 줄의 주석을 해제하세요.
# docker pull "${IMAGE}"

# --- 기존 컨테이너가 있으면 제거 (실행 중/중지 상태 모두) ---
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[info] Removing existing container: ${CONTAINER_NAME}"
  docker rm -f "${CONTAINER_NAME}" >/dev/null
fi

# --- Mailpit 컨테이너 실행 ---
echo "[info] Starting Mailpit..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${SMTP_PORT}:1025" \
  -p "${WEB_PORT}:8025" \
  "${IMAGE}" >/dev/null

# --- 실행 완료 메시지 ---
cat <<MSG
[ok] Mailpit is running.
- SMTP: localhost:${SMTP_PORT}
- Web UI: http://localhost:${WEB_PORT}
MSG

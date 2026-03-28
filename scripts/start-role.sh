#!/bin/bash

# ============================================================
# Claude Role Launcher
# Usage: ./start-role.sh <role>
# Roles: pm | designer | frontend | server-implement | server-review
# Ex:
# sh ./start-role.sh pm
# sh ./start-role.sh designer
# ============================================================

ROLES_DIR="docs/claude_docs/roles"
OUTPUTS_DIR="docs/claude_docs/outputs"
CLAUDE_MD="CLAUDE.md"

# ── 색상 출력 ──────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# ── 사용법 출력 ────────────────────────────────────────────
usage() {
  echo -e "${CYAN}"
  echo "╔══════════════════════════════════════════╗"
  echo "║         Claude Role Launcher             ║"
  echo "╠══════════════════════════════════════════╣"
  echo "║  사용법: ./start-role.sh <role>          ║"
  echo "║                                          ║"
  echo "║  역할 목록:                              ║"
  echo "║    pm               → PM                ║"
  echo "║    designer         → 디자이너           ║"
  echo "║    frontend         → 프론트 개발자      ║"
  echo "║    server-implement → 서버 구현 담당     ║"
  echo "║    server-review    → 서버 리뷰 담당     ║"
  echo "╚══════════════════════════════════════════╝"
  echo -e "${NC}"
  exit 1
}

# ── 인자 검증 ─────────────────────────────────────────────
ROLE=$1

if [ -z "$ROLE" ]; then
  echo -e "${RED}❌ 역할을 입력해주세요.${NC}"
  usage
fi

# ── 역할 파일 매핑 ─────────────────────────────────────────
case "$ROLE" in
  pm)               ROLE_FILE="$ROLES_DIR/pm.md";               ROLE_NAME="PM" ;;
  designer)         ROLE_FILE="$ROLES_DIR/designer.md";         ROLE_NAME="디자이너" ;;
  frontend)         ROLE_FILE="$ROLES_DIR/frontend.md";         ROLE_NAME="프론트 개발자" ;;
  server-implement) ROLE_FILE="$ROLES_DIR/server-implement.md"; ROLE_NAME="서버 구현 담당" ;;
  server-review)    ROLE_FILE="$ROLES_DIR/server-review.md";    ROLE_NAME="서버 리뷰 담당" ;;
  *)
    echo -e "${RED}❌ 알 수 없는 역할: '$ROLE'${NC}"
    usage
    ;;
esac

# ── 파일 존재 확인 ─────────────────────────────────────────
if [ ! -f "$ROLE_FILE" ]; then
  echo -e "${RED}❌ 역할 파일을 찾을 수 없습니다: $ROLE_FILE${NC}"
  exit 1
fi

if [ ! -f "$CLAUDE_MD" ]; then
  echo -e "${RED}❌ CLAUDE.md 파일을 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요.${NC}"
  exit 1
fi

# ── outputs 디렉토리 생성 ──────────────────────────────────
mkdir -p "$OUTPUTS_DIR"

# ── 세션 시작 메시지 ───────────────────────────────────────
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║       Claude Role Session Start          ║"
echo "╠══════════════════════════════════════════╣"
printf "║  역할: %-34s║\n" "$ROLE_NAME"
printf "║  파일: %-34s║\n" "$ROLE_FILE"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── 이전 outputs 파일 목록 표시 ───────────────────────────
if [ "$(ls -A $OUTPUTS_DIR 2>/dev/null)" ]; then
  echo -e "${YELLOW}📂 이전 세션 산출물:${NC}"
  ls -1 "$OUTPUTS_DIR" | while read f; do
    echo "   - $f"
  done
  echo ""
fi

# ── 초기 프롬프트 생성 ─────────────────────────────────────
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
PROMPT="## 세션 초기화 ($TIMESTAMP)

다음 파일들을 순서대로 읽고 역할을 적용해줘.

1. $CLAUDE_MD
   → 프로젝트 전체 컨텍스트, 기술스택, 아키텍처 원칙

2. $ROLE_FILE
   → 이번 세션에서 맡을 역할과 책임"

# outputs에 파일이 있으면 참고하도록 추가
if [ "$(ls -A $OUTPUTS_DIR 2>/dev/null)" ]; then
  PROMPT="$PROMPT

3. $OUTPUTS_DIR/ 디렉토리 내 파일들
   → 이전 세션 산출물 참고 (최신 파일 우선)"
fi

PROMPT="$PROMPT

---
파일을 모두 읽은 후:
- 역할과 현재 프로젝트 상태를 한 줄로 요약해줘.
- 이번 세션에서 어떤 작업을 도와줄 수 있는지 알려줘.
- 작업 지시를 기다려줘."

# ── Claude Code 실행 ───────────────────────────────────────
echo -e "${CYAN}🚀 Claude Code 시작 중...${NC}"
echo ""

claude --print "$PROMPT" | cat
claude
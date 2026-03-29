#!/bin/bash

# ============================================================
# Claude Orchestrator
# Usage: ./orchestrate.sh "기능 요청 내용"
# ============================================================

ROLES_DIR="docs/claude_docs/roles"
OUTPUTS_DIR="docs/claude_docs/outputs"
CLAUDE_MD="CLAUDE.md"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# ── 사용법 ─────────────────────────────────────────────────
usage() {
  echo -e "${CYAN}"
  echo "╔══════════════════════════════════════════╗"
  echo "║        Claude Orchestrator               ║"
  echo "╠══════════════════════════════════════════╣"
  echo "║  사용법:                                 ║"
  echo "║  ./orchestrate.sh \"기능 요청 내용\"      ║"
  echo "╚══════════════════════════════════════════╝"
  echo -e "${NC}"
  exit 1
}

# ── 인자 검증 ─────────────────────────────────────────────
FEATURE_REQUEST=$1

if [ -z "$FEATURE_REQUEST" ]; then
  echo -e "${RED}❌ 기능 요청 내용을 입력해주세요.${NC}"
  usage
fi

if [ ! -f "$CLAUDE_MD" ]; then
  echo -e "${RED}❌ CLAUDE.md 파일을 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요.${NC}"
  exit 1
fi

mkdir -p "$OUTPUTS_DIR"

# 타임스탬프 기반 세션 ID (같은 기능 요청이 여러번 있을 경우 덮어쓰지 않기 위함)
SESSION_ID=$(date "+%Y%m%d_%H%M%S")
TASK_FILE="$OUTPUTS_DIR/tasks_${SESSION_ID}.md"
DESIGN_FILE="$OUTPUTS_DIR/design_${SESSION_ID}.md"
SERVER_IMPL_FILE="$OUTPUTS_DIR/server_impl_${SESSION_ID}.md"
SERVER_REVIEW_FILE="$OUTPUTS_DIR/server_review_${SESSION_ID}.md"
FRONTEND_FILE="$OUTPUTS_DIR/frontend_impl_${SESSION_ID}.md"

# ── 단계 실행 함수 ─────────────────────────────────────────
run_agent() {
  local STEP=$1
  local ROLE_NAME=$2
  local ROLE_FILE=$3
  local PROMPT=$4
  local OUTPUT_FILE=$5

  echo -e "${CYAN}${BOLD}"
  echo "┌──────────────────────────────────────────┐"
  printf "│  Step %s: %-34s│\n" "$STEP" "$ROLE_NAME"
  echo "└──────────────────────────────────────────┘"
  echo -e "${NC}"

  # Claude Code 서브에이전트 실행
  RESULT=$(claude --print \
    --system-prompt "$(cat $CLAUDE_MD)

$(cat $ROLE_FILE)" \
    "$PROMPT" 2>&1)

  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Step $STEP 실패: $ROLE_NAME${NC}"
    echo -e "${RED}오류 내용:${NC}"
    echo "$RESULT"
    echo ""
    echo -e "${YELLOW}⚠️  오케스트레이터가 중단되었습니다.${NC}"
    echo -e "${YELLOW}   수동으로 아래 명령어로 해당 단계를 재실행할 수 있습니다:${NC}"
    echo -e "${YELLOW}   ./start-role.sh $(basename $ROLE_FILE .md)${NC}"
    exit 1
  fi

  # 결과물 파일 저장
  echo "$RESULT" > "$OUTPUT_FILE"

  # 완료 요약 출력
  echo -e "${GREEN}✅ Step $STEP 완료: $ROLE_NAME${NC}"
  echo -e "${GREEN}   산출물: $OUTPUT_FILE${NC}"

  # 결과 요약 (앞 10줄만 미리보기)
  echo -e "${YELLOW}   미리보기:${NC}"
  echo "$RESULT" | head -10 | sed 's/^/   /'
  echo "   ..."
  echo ""
}

# ── 리뷰 검증 함수 ─────────────────────────────────────────
# 리뷰 결과에 재작업 필요 여부를 판단
check_review() {
  local REVIEW_FILE=$1

  # 리뷰 파일에서 재작업 필요 키워드 탐지
  if grep -qiE "(재작업|수정 필요|critical|blocker|심각|반드시 수정)" "$REVIEW_FILE"; then
    return 1  # 재작업 필요
  fi
  return 0  # 통과
}

# ── 오케스트레이터 시작 ────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════╗"
echo "║       Claude Orchestrator 시작           ║"
echo "╠══════════════════════════════════════════╣"
echo "║  PM → 디자이너 → 서버구현 →             ║"
echo "║  서버리뷰 → 프론트 순으로 자동 실행     ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${YELLOW}📋 기능 요청:${NC}"
echo "$FEATURE_REQUEST" | sed 's/^/   /'
echo ""

# ── Step 1: PM ─────────────────────────────────────────────
run_agent "1" "PM - 태스크 분석 및 분배" \
  "$ROLES_DIR/pm.md" \
  "아래 기능 요청을 분석하고 태스크를 분리해줘.

## 기능 요청
$FEATURE_REQUEST

## 결과물 형식
1. 기능 개요 요약
2. 프론트엔드 태스크 목록 (우선순위 포함)
3. 백엔드 태스크 목록 (우선순위 포함)
4. 태스크 간 의존관계
5. 엣지케이스 목록
6. 완료 기준 (Definition of Done)" \
  "$TASK_FILE"

# ── Step 2: 디자이너 ───────────────────────────────────────
run_agent "2" "디자이너 - UI/UX 설계" \
  "$ROLES_DIR/designer.md" \
  "아래 태스크 분석 결과를 바탕으로 UI/UX 구조를 설계해줘.

## PM 태스크 분석 결과
$(cat $TASK_FILE)

## 원본 기능 요청
$FEATURE_REQUEST

## 결과물 형식
1. 페이지별 컴포넌트 계층 구조
2. 각 컴포넌트의 역할 및 책임
3. 상태별 UI 처리 방식 (로딩/에러/빈상태 포함)
4. 컴포넌트 간 데이터 흐름" \
  "$DESIGN_FILE"

# ── Step 3: 서버 구현 ─────────────────────────────────────
run_agent "3" "서버 구현 - 백엔드 개발" \
  "$ROLES_DIR/server-implement.md" \
  "아래 태스크 분석을 바탕으로 서버 기능을 구현해줘.

## PM 태스크 분석 결과
$(cat $TASK_FILE)

## 원본 기능 요청
$FEATURE_REQUEST

## 구현 요청사항
1. Flyway 마이그레이션 스크립트 (필요 시)
2. 도메인 모델 및 포트/어댑터 구조
3. 서비스 레이어 비즈니스 로직
4. API 엔드포인트 구현
5. 각 구현에 대한 설명 포함" \
  "$SERVER_IMPL_FILE"

# ── Step 4: 서버 리뷰 ─────────────────────────────────────
run_agent "4" "서버 리뷰 - 코드 검토" \
  "$ROLES_DIR/server-review.md" \
  "아래 서버 구현 코드를 검토해줘.

## 서버 구현 결과
$(cat $SERVER_IMPL_FILE)

## PM 태스크 분석 결과
$(cat $TASK_FILE)

## 검토 항목
1. 보안 취약점 여부
2. N+1 문제 및 성능 이슈
3. 트랜잭션 범위 적절성
4. 엣지케이스 처리 누락 여부
5. 헥사고날 아키텍처 원칙 준수 여부

## 결과물 형식
- 통과 항목은 ✅ 로 표시
- 재작업 필요 항목은 '재작업 필요:' 로 시작
- Critical 이슈는 '심각:' 으로 시작
- 개선 제안은 구체적인 코드와 이유 포함" \
  "$SERVER_REVIEW_FILE"

# ── 리뷰 결과 검증 ────────────────────────────────────────
echo -e "${YELLOW}🔍 서버 리뷰 결과 검증 중...${NC}"
if ! check_review "$SERVER_REVIEW_FILE"; then
  echo -e "${RED}"
  echo "╔══════════════════════════════════════════╗"
  echo "║  ⚠️  서버 리뷰에서 재작업 항목 발견!    ║"
  echo "╠══════════════════════════════════════════╣"
  echo "║  오케스트레이터가 중단되었습니다.        ║"
  echo "║                                          ║"
  echo "║  아래 명령어로 리뷰 결과를 확인하고      ║"
  echo "║  서버 구현을 수정한 후 재실행해주세요:   ║"
  echo "╚══════════════════════════════════════════╝"
  echo -e "${NC}"
  echo -e "${YELLOW}  리뷰 결과 확인:${NC}"
  echo "  cat $SERVER_REVIEW_FILE"
  echo ""
  echo -e "${YELLOW}  서버 구현 재작업:${NC}"
  echo "  ./start-role.sh server-implement"
  echo ""
  exit 1
fi
echo -e "${GREEN}✅ 서버 리뷰 통과${NC}"
echo ""

# ── Step 5: 프론트엔드 ────────────────────────────────────
run_agent "5" "프론트엔드 - 화면 구현" \
  "$ROLES_DIR/frontend.md" \
  "아래 태스크 분석과 UI 설계를 바탕으로 프론트엔드를 구현해줘.

## PM 태스크 분석 결과
$(cat $TASK_FILE)

## UI/UX 설계 결과
$(cat $DESIGN_FILE)

## 원본 기능 요청
$FEATURE_REQUEST

## 구현 요청사항
1. 컴포넌트 계층 구조대로 최소 단위 분리
2. 불필요한 리렌더링 방지 처리
3. API 연동 (로딩/에러 상태 처리 포함)
4. 각 컴포넌트의 역할 설명 포함" \
  "$FRONTEND_FILE"

# ── 완료 ──────────────────────────────────────────────────
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════╗"
echo "║        🎉 모든 단계 완료!                ║"
echo "╠══════════════════════════════════════════╣"
echo "║  산출물 목록:                            ║"
printf "║  %-42s║\n" "• $(basename $TASK_FILE)"
printf "║  %-42s║\n" "• $(basename $DESIGN_FILE)"
printf "║  %-42s║\n" "• $(basename $SERVER_IMPL_FILE)"
printf "║  %-42s║\n" "• $(basename $SERVER_REVIEW_FILE)"
printf "║  %-42s║\n" "• $(basename $FRONTEND_FILE)"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${YELLOW}📂 산출물 위치: $OUTPUTS_DIR${NC}"
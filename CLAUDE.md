@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Next.js TODO 앱. TypeScript + Tailwind CSS v4 + ShadCN UI 설정 완료.

## Commands

```bash
npm run dev    # 개발 서버 (http://localhost:3000)
npm run build  # 프로덕션 빌드
npm run lint   # ESLint
```

## Tech Stack

- TypeScript
- Next.js 16 (App Router)
- Tailwind CSS v4
- ShadCN UI

## Architecture

```
src/
  app/
    page.tsx          # 홈 페이지 (서버 컴포넌트)
    layout.tsx        # 루트 레이아웃
    globals.css       # 전역 스타일 + ShadCN 토큰
  components/
    ui/               # ShadCN 자동 생성 UI 컴포넌트
    TodoList.tsx      # TODO 목록 상태 관리 (클라이언트)
    TodoItem.tsx      # 개별 TODO 항목 (클라이언트)
  types/
    todo.ts           # Todo, Priority 타입 정의
  lib/
    utils.ts          # ShadCN cn() 유틸
```

## Coding Rules

- Use functional React components
- Prefer server components
- Use Tailwind utilities instead of custom CSS

## Design System

- Follow ShadCN patterns
- Use tokens from globals.css

# 테스트 코드 작성 시 준수 사항

## 반드시 지켜주세요!

### 테스트 코드의 품질

- 반드시 실제 기능을 검증할 것
- 'expect(true).to Be(true)'과 같은 무의미한 어설션은 절대로 작성하지 말 것
- 각 테스트 케이스는 구체적인 입력과 예상 출력의 검증을 포함할 것
- 모의 객체 사용을 최소화하고, 실제 환경과 가깝게 테스트

### 하드코딩 금지

- 테스트 통과만을 위한 하드코딩 절대 금지
- 프로덕션 코드에 'if (testMode)'와 같은 조건문을 포함할 것
- 테스트용 매직 넘버를 프로덕션 코드에 포함하지 말 것
- 환경 변수나 설정 파일을 활용해 테스트 환경과 프로덕션 환경을 분리할 것

### 테스트 구현 원칙

- 테스트가 실패하는 상태에서 시작(Red-Green-Refactor)
- 경곗값, 예외 상황, 오류가 발생할 수 있는 경우도 반드시 테스트
- 커버리지뿐만 아니라 실제 품질을 중시
- 테스트 케이스 이름에 무엇을 테스트하는지 명확히 기재

### 구현 전 확인

- 기능 명세를 정확히 이해한 후 테스트를 작성
- 불명확한 점이 있으면 임시로 구현하지 말고, 반드시 사용자에게 확인할 것

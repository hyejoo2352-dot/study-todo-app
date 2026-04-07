# TODO

## 🔴 Critical — 기능 동작 불가

### 1. Prisma 스키마 모델 교체
- **문제**: `prisma/schema.prisma`에 `Message { id, content, createdAt }` 모델이 정의되어 있으나, 앱은 `Task` 데이터를 사용함
- **할 일**: `Message` 모델을 삭제하고 아래 `Task` 모델로 교체
  ```prisma
  model Task {
    id        Int      @id @default(autoincrement())
    title     String
    section   String   // "morning" | "evening"
    done      Boolean  @default(false)
    startedAt DateTime?
    emoji     String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```
  > `running`, `updatedLabel`은 UI 전용 파생 상태이므로 DB에 저장하지 않음

### 2. `dotenv` 패키지 미설치
- **문제**: `prisma.config.ts`가 `import "dotenv/config"`를 사용하지만, `dotenv`가 `package.json`에 없어 `prisma migrate dev` 실행 시 오류 발생
- **할 일**: `npm install --save-dev dotenv`

### 3. DB 마이그레이션 미실행
- **문제**: `prisma/migrations/` 디렉터리 없음, `dev.db` 파일 없음 — DB가 실제로 생성된 적 없음
- **할 일**: 스키마 수정 후 `npx prisma migrate dev --name init` 실행

### 4. API Route 없음
- **문제**: `app/api/` 디렉터리 자체가 없음 — 태스크 CRUD를 처리할 서버 엔드포인트가 전혀 없음
- **할 일**: 아래 Route Handler 파일 생성
  - `app/api/tasks/route.ts` — `GET` (전체 조회), `POST` (생성)
  - `app/api/tasks/[id]/route.ts` — `PATCH` (수정), `DELETE` (삭제)

### 5. DB 연동 없음 (프론트엔드)
- **문제**: `page.tsx`의 모든 태스크가 `INITIAL_TASKS` 하드코딩 상수에만 존재. 추가/수정/삭제가 클라이언트 메모리에만 반영되고 새로고침 시 초기화됨
- **할 일**:
  - `useEffect`로 마운트 시 `GET /api/tasks` 호출하여 초기 데이터 로드
  - `addTask()` → `POST /api/tasks` 호출
  - `saveEdit()` → `PATCH /api/tasks/[id]` 호출
  - `deleteTask()` → `DELETE /api/tasks/[id]` 호출
  - `toggleTask()` → `PATCH /api/tasks/[id]` 호출 (`done`, `startedAt` 업데이트)

---

## 🟠 High — 테스트 전면 수정 필요

### 6. `page.test.tsx` 테스트 전체가 현재 UI와 불일치
- **문제**: UI가 완전히 개편되었으나 테스트는 이전 단순 목록 구조 기준으로 작성됨. 4개 테스트 모두 실패함

  | 테스트에서 기대하는 것 | 실제 UI |
  |---|---|
  | `"할 일이 없습니다."` | `"아침 할 일이 없습니다."` / `"저녁 할 일이 없습니다."` |
  | `placeholder="할 일을 입력하세요"` | `"아침 할 일 추가..."` / `"저녁 할 일 추가..."` |
  | `role="checkbox"` | 체크박스 없음 — 토글 버튼 방식 |
  | `role="button" { name: "삭제" }` 직접 접근 | 삭제 버튼은 편집 모달 안에만 존재 |

- **할 일**: 현재 UI 구조(Morning/Evening 섹션, 토글 버튼, 편집 모달)에 맞게 테스트 전면 재작성

### 7. Vitest 설정에 React JSX 트랜스파일러 누락
- **문제**: `vitest.config.ts`에 `@vitejs/plugin-react`가 없어 TSX 파일 변환이 안 됨 → 테스트 실행 자체가 실패할 수 있음
- **할 일**:
  ```bash
  npm install --save-dev @vitejs/plugin-react
  ```
  `vitest.config.ts`에 추가:
  ```ts
  import react from "@vitejs/plugin-react";
  export default defineConfig({ plugins: [react()], test: { ... } });
  ```

### 8. Vitest `setupFiles` 미설정
- **문제**: `@testing-library/jest-dom` 매처가 테스트 파일별로 직접 import되지만, Vitest 전역 설정에 `setupFiles`가 없어 `globals: true` 환경에서 누락될 수 있음
- **할 일**: `vitest.config.ts`에 `setupFiles: ['@testing-library/jest-dom']` 추가

---

## 🟡 Medium — 기능 미완성

### 9. 로딩 / 에러 상태 없음
- **문제**: API 연동 후 데이터 로딩 중 화면이 비거나, 네트워크 에러 시 사용자에게 아무 피드백이 없음
- **할 일**: 로딩 스켈레톤 UI 추가, fetch 실패 시 에러 메시지 표시

### 10. 주간 캘린더 스트립이 순수 장식
- **문제**: 7일치 날짜가 표시되지만 오늘 외 날짜를 클릭해도 아무 동작이 없음. 점(dot)도 오늘 완료 태스크에만 표시됨
- **할 일**: 날짜 클릭 시 해당 날짜의 태스크를 조회하는 기능 구현 (또는 현재 의도적 제한이라면 클릭 이벤트 제거)

---

## 🟢 Low — 개선 사항

### 11. 레이아웃 메타데이터 미수정
- **문제**: `layout.tsx`의 `title`이 `"Create Next App"`, `description`이 기본값 그대로임
- **할 일**: 앱 이름과 설명으로 업데이트

### 12. 유저 아바타 버튼 미구현
- **문제**: 헤더의 👤 버튼이 클릭해도 아무 동작 없는 더미 UI
- **할 일**: 프로필/설정 기능을 구현하거나 버튼 제거

### 13. 새 태스크 이모지 선택 불가
- **문제**: 태스크 추가 시 이모지가 섹션에 따라 ☀️/🌙으로 고정됨. 편집 모달에서도 이모지 변경 불가
- **할 일**: 이모지 선택 UI 추가 (간단한 프리셋 또는 입력 필드)

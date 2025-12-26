# Gng - AI Chat Workbench 개발 가이드

## 프로젝트 개요

- **타입**: Next.js App Router SPA
- **설명**: AI Chat Workbench for prompt & model experiments
- **패키지 매니저**: npm
- **빌드 도구**: Next.js 16

## 기술 스택

### 코어

- Next.js 16.1.1 (App Router)
- React 19.2.3
- TypeScript 5

### 상태 관리

- Jotai (클라이언트 상태)
- Dexie + dexie-react-hooks (IndexedDB - 로컬 저장소)

### UI

- Tailwind CSS 4
- shadcn/ui (new-york 스타일)
- Radix UI (primitives)
- Lucide React (아이콘)
- tw-animate-css (애니메이션)

### 유틸리티

- Zod (유효성 검사)
- uuid (고유 ID 생성)

## 디렉토리 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── chat/          # 채팅 API
│   │   ├── projects/      # 프로젝트 API
│   │   └── threads/       # 스레드 API
│   ├── globals.css        # 전역 스타일 + CSS 변수
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── chat/              # 채팅 관련 컴포넌트
│   │   ├── index.tsx
│   │   ├── chat-header.tsx
│   │   ├── chat-input.tsx
│   │   └── message-list.tsx
│   ├── sidebar/           # 사이드바 컴포넌트
│   └── providers.tsx      # React Context Providers
├── lib/
│   ├── db/                # Dexie 데이터베이스
│   ├── hooks/             # 커스텀 훅
│   │   ├── use-projects.ts
│   │   ├── use-threads.ts
│   │   └── use-messages.ts
│   ├── providers/         # AI Provider 구현
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── xai.ts
│   │   └── types.ts
│   └── utils.ts           # 유틸리티 (cn 함수 등)
├── stores/                # Jotai atoms
│   └── index.ts
└── types/                 # 타입 정의
    └── index.ts
```

## 개발 규칙

### 컴포넌트

- 함수형 컴포넌트만 사용
- 구조분해할당 필수
- Props 타입은 인라인 또는 별도 정의

### 상태 관리

- 서버 상태: 없음 (TanStack Query 미사용)
- 클라이언트 상태: Jotai atoms
- 영속 데이터: Dexie (IndexedDB)

### 스타일링

- Tailwind CSS 4 유틸리티 클래스
- CSS 변수 기반 다크모드 (`.dark` 클래스)
- shadcn/ui 컴포넌트 활용

### 경로 별칭

```typescript
@/* -> ./src/*
```

## 실행 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 서버
npm start

# 린트
npm run lint
```

## AI Provider

프로젝트는 여러 AI 제공자를 지원:

- OpenAI
- Anthropic (Claude)
- xAI (Grok)

각 Provider는 `src/lib/providers/`에 구현

## 참조 문서

프론트엔드 개발 시 참조:

- `@~/.claude/_mds/REACT.md`
- `@~/.claude/_mds/libraries/JOTAI.md`
- `@~/.claude/_mds/FE.md`

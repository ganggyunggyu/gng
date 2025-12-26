# Gng - AI Chat Workbench

## 프로젝트 개요
프로젝트 단위로 시스템 프롬프트/모델을 교체하며 결과를 비교하는 AI Chat Workbench.  
Next.js App Router 기반이며 SSE 스트리밍을 통해 채팅 응답을 수신한다.

## 기술 스택
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Jotai (클라이언트 상태)
- Dexie (IndexedDB)
- Axios (서버-모델 통신)
- Providers: OpenAI, Anthropic, Gemini, xAI, DeepSeek, Solar

## 폴더 구조 (FSD)
```
src/
├── app/                # 라우트, 레이아웃, API route
│   ├── api/             # /api/* route handlers
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx    # Jotai/Tooltip Provider
├── entities/           # 도메인 모델 + API
├── features/           # 기능 단위 UI/모델/훅
└── shared/             # 공용 API, UI, lib, types
    ├── api/             # provider adapter + callAI
    ├── lib/             # cn 유틸
    ├── ui/              # 공용 UI 컴포넌트
    └── types/           # 공용 타입
```

## 핵심 파일
- `src/shared/api/call-ai.ts`: 통합 AI 호출 (비스트리밍/스트리밍)
- `src/shared/api/*`: Provider adapter (openai/anthropic/gemini/xai/deepseek/solar)
- `src/shared/lib/utils.ts`: `cn` 유틸
- `src/app/api/chat/route.ts`: SSE 스트리밍 엔드포인트
- `src/app/providers.tsx`: 전역 Provider 구성

## 개발 명령어
```bash
npm run dev
npm run build
npm run lint
```

## 환경 변수
`.env.local`에 아래 키 설정:
```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
XAI_API_KEY=
DEEPSEEK_API_KEY=
SOLAR_API_KEY=
```

## 코드 규칙 (프로젝트 기준)
- `@/` 절대 경로 import 사용 (레이어 간 이동 시 상대 경로 금지).
- `className`은 항상 `cn()` 사용.
- React Fragment는 `React.Fragment`만 사용.
- Jotai atom은 `src/shared` 또는 `features` 레이어에 배치.
- SSE 스트리밍 형식은 `src/shared/api/types.ts` 규격 유지.
- 신규 Provider 추가 시:
  - `src/shared/api/`에 adapter 추가
  - `src/shared/api/models.ts`에 모델/표시명/Provider 매핑 추가
  - `src/shared/api/index.ts`에서 adapter 등록

## UI 규칙
- 이모지 사용 지양, 아이콘은 `lucide-react` 사용.
- Tailwind v4 유틸만 사용, 필요 시 `cn()`로 조건부 클래스 구성.

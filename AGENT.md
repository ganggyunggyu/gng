# Gng - AI Chat Workbench

## 프로젝트 개요

프로젝트 단위로 시스템 프롬프트/모델을 갈아끼우며 결과를 비교·회귀테스트까지 하는 AI Chat Workbench

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Jotai
- **DB**: Dexie (IndexedDB)
- **Providers**: OpenAI, Anthropic, xAI

## 폴더 구조

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # SSE 스트리밍 채팅
│   │   ├── projects/route.ts  # 프로젝트 CRUD
│   │   └── threads/route.ts   # 스레드 CRUD
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── chat/                  # 채팅 UI
│   ├── sidebar/               # 사이드바
│   ├── settings/              # 설정 (예정)
│   ├── ui/                    # shadcn/ui 컴포넌트
│   └── providers.tsx          # Jotai + Tooltip Provider
├── lib/
│   ├── db/index.ts            # Dexie DB 설정
│   ├── providers/             # AI Provider 어댑터
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   └── xai.ts
│   └── utils.ts               # cn() 유틸
├── stores/index.ts            # Jotai atoms
└── types/index.ts             # 타입 정의
```

## 주요 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

## 환경변수

`.env.local` 파일에 API 키 설정 필요:

```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
XAI_API_KEY=
```

## 개발 규칙

1. **서버 전용 키**: API 키는 절대 `NEXT_PUBLIC_` 접두사 사용 금지
2. **ID 규칙**:
   - Project: `prj_gng_...`
   - Thread: `th_gng_...`
   - Message: `msg_gng_...`
3. **스트리밍**: Route Handler에서 SSE 스트림 반환

## 다음 단계 (TODO)

- [ ] 프로젝트 생성/삭제 UI
- [ ] 스레드 생성/삭제 UI
- [ ] 프롬프트 버전 관리 UI
- [ ] Settings 패널 (모델 선택, 파라미터)
- [ ] Eval (회귀 테스트) 기능
- [ ] 다크 모드 토글

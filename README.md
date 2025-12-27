# Gng - AI Chat Workbench

프로젝트 단위로 시스템 프롬프트와 모델을 교체하며 결과를 비교하는 AI Chat Workbench.

## 주요 기능

- **다중 AI Provider 지원**: OpenAI, Anthropic, Gemini, xAI, DeepSeek, Solar
- **이미지 생성**: DALL-E 2/3, Imagen 3/4, Grok Image 지원
- **프로젝트 기반 관리**: 프로젝트별로 시스템 프롬프트와 모델 설정
- **SSE 스트리밍**: 실시간 응답 수신
- **로컬 저장**: IndexedDB를 통한 대화 기록 저장

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript |
| State | Jotai |
| Storage | Dexie (IndexedDB) |
| HTTP | Axios |
| UI Components | Radix UI, Lucide React |

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm, yarn, pnpm, 또는 bun

### 설치

```bash
git clone <repository-url>
cd gng
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 사용할 Provider의 API 키를 설정:

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key
XAI_API_KEY=your_xai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
SOLAR_API_KEY=your_solar_api_key
```

모든 키를 설정할 필요는 없음. 사용할 Provider의 키만 설정하면 됨.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

### 빌드

```bash
npm run build
npm run start
```

### 린트

```bash
npm run lint
```

## 폴더 구조

Feature-Sliced Design(FSD) 아키텍처 적용:

```
src/
├── app/                  # 라우트, 레이아웃, API route
│   ├── api/
│   │   ├── chat/         # SSE 스트리밍 엔드포인트
│   │   └── image/        # 이미지 생성 API
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx     # 전역 Provider 구성
│
├── entities/             # 도메인 모델
│   ├── message/          # 메시지 모델, API
│   ├── project/          # 프로젝트 모델, API
│   ├── prompt-version/   # 프롬프트 버전 관리
│   └── thread/           # 스레드 모델, API
│
├── features/             # 기능 단위 UI/모델
│   ├── chat/             # 채팅 기능
│   ├── settings/         # 설정 기능
│   └── sidebar/          # 사이드바 기능
│
└── shared/               # 공용 모듈
    ├── db/               # Dexie DB 설정
    ├── lib/              # 유틸리티 (cn 등)
    ├── providers/        # AI Provider adapters
    │   ├── adapters/     # Provider별 adapter 구현
    │   ├── call-ai.ts    # 통합 AI 호출 함수
    │   └── models.ts     # 모델/Provider 매핑
    ├── types/            # 공용 타입 정의
    └── ui/               # 공용 UI 컴포넌트
```

## 핵심 파일

| 파일 | 설명 |
|------|------|
| `src/shared/providers/call-ai.ts` | 통합 AI 호출 (스트리밍) |
| `src/shared/providers/models.ts` | 모델/Provider/이미지모델 매핑 |
| `src/shared/providers/adapters/` | Provider별 SSE 스트리밍 adapter |
| `src/app/api/chat/route.ts` | SSE 스트리밍 API 엔드포인트 |
| `src/app/api/image/route.ts` | 이미지 생성 API 엔드포인트 |

## 이미지 모델 변경

`src/shared/providers/models.ts`에서 `CURRENT_IMAGE_MODEL` 상수를 변경:

```typescript
// 사용 가능한 이미지 모델
export const ImageModel = {
  DALLE_3: 'dall-e-3',           // $0.040/장
  DALLE_2: 'dall-e-2',           // $0.016~0.020/장
  IMAGEN_3: 'imagen-3.0-generate-002',
  IMAGEN_3_FAST: 'imagen-3.0-fast-generate-001',
  IMAGEN_4: 'imagen-4.0-generate-001',
  GROK_IMAGE: 'grok-2-image',    // ~$0.07/장
} as const;

// 현재 사용할 이미지 모델 (여기만 바꾸면 됨)
export const CURRENT_IMAGE_MODEL = ImageModel.IMAGEN_4;
```

## 새 Provider 추가

1. `src/shared/providers/adapters/`에 adapter 파일 생성
2. `src/shared/providers/models.ts`에 모델 정보 추가
3. `src/shared/providers/adapters/index.ts`에서 adapter export
4. `src/shared/providers/index.ts`에서 adapter 등록

## 라이선스

MIT

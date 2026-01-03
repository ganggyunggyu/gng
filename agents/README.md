# Voice Agent

LiveKit 기반 실시간 음성 AI 에이전트

## 설치

```bash
cd agents
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 환경 변수

프로젝트 루트의 `.env.local`에 설정:

```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-app.livekit.cloud

# Voice Providers
XAI_API_KEY=your_xai_key     # Grok
GEMINI_API_KEY=your_gemini_key  # Gemini
```

## 로컬 실행

```bash
python voice_agent.py dev
```

## LiveKit Cloud 배포

```bash
lk cloud deploy
```

## 지원 프로바이더

| Provider | Model | 특징 |
|----------|-------|------|
| Grok | grok-2-public | $0.05/분, 100+ 언어 |
| Gemini | gemini-2.5-flash-native-audio | 자연스러운 대화, 24개 언어 |

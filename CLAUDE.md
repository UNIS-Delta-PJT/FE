# Claude Code Guidelines

## Commits
- Do NOT add `Co-Authored-By` lines in commit messages.

## Design System

### Color
- Primary (brand green): `#1CD1A1` — 기존 `#2ECC71`/`#27AE60`은 모두 이 색으로 대체됨. 새 UI에서도 초록 계열은 이 색만 사용.
- 제목(title): `#1A1A1A`
- 설명글(description): `#555555`
- 아이콘(icon): `#999999` 또는 `#EAEAEA` 또는 `#F4F4F4`

### Typography (Pretendard)
- h1: 28px / bold
- h2: 24px / semibold
- h3 (필요시): 18px
- body: 16px / medium
- caption: 12px / regular (일부 10px 허용)
- 활성화 상태 표현: 더 두꺼운 weight 또는 색상 변경

### Layout
- 큰 박스: corner radius 20px
- 작은 박스: corner radius 10~15px
- 박스 간 간격: 36px

### 말풍선 (speech bubble)
- 배경 `#FFFFFF` + drop shadow (`0 4px 14px rgba(0,0,0,0.12)`), 꼬리도 흰색으로 통일

### 새 화면 추가 규칙
- 새 화면은 App.jsx의 `fullscreen` 목록에 추가해 상단 패딩 없이 화면 최상단에 밀착시킬 것 (절대좌표는 화면 최상단 기준)
- 화면 전환 시 스크롤은 자동으로 최상단 리셋됨 (App의 scrollRef effect) — 화면 내부 탭 전환 시에도 리셋 필요
- 토스트: 낮은 높이 (padding 6px 16px)

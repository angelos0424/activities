# Activities PRD

## 1. Product Summary

Activities의 현재 MVP 목표는 Discord 특정 채널에서 slash command로 사용하는
업무 자동화 봇이다. 사용자는 별도 웹 화면에 들어가지 않고, 지정된 Discord
채널에서 명령어를 실행해 반복 업무를 요청하고 결과를 확인한다.

기존 웹 앱 중심 PRD는 더 이상 현재 MVP의 기준이 아니다. React/Vite 프론트엔드,
웹 업로드 화면, 회의 상세/검색 화면, Android 패키징 경로는 보류한다.

## 2. MVP Goal

현재 MVP는 다음 한 문장으로 정의한다.

> Discord 특정 채널에서 slash command로 사용하는 업무 자동화 봇.

핵심 제품 판단 기준은 Discord 안에서 업무 자동화 요청과 결과 확인이 끝나는지다.
웹 UI, 프론트엔드 화면, 모바일 패키징은 이번 MVP의 완료 조건이 아니다.

## 3. Goals

1. 봇은 설정된 Discord 채널에서만 MVP slash command를 받는다.
2. 사용자는 slash command로 업무 자동화 작업을 요청한다.
3. 봇은 요청 처리 결과, 실패 사유, 다음 행동을 Discord 메시지로 반환한다.
4. MVP 문서와 구현 계획은 Discord bot command flow를 기준으로 작성한다.

## 4. Non-goals for MVP

1. 웹 UI 또는 프론트엔드 화면 제공.
2. React/Vite 클라이언트 기능 구현.
3. Android 또는 기타 모바일 앱 패키징.
4. 브라우저 기반 업로드, 리스트, 상세, 검색, 보고서 출력 화면.
5. Discord 외부 채널을 위한 별도 사용자 인터페이스.

## 5. Target Users

| User | Need |
| --- | --- |
| Discord 채널 사용자 | 업무 자동화를 slash command로 요청하고 같은 채널에서 결과를 확인한다. |
| 운영자 | 봇이 동작할 Discord 채널과 사용할 명령 범위를 명확히 관리한다. |

## 6. Core User Flow

```text
Discord user
  |
  | slash command in configured channel
  v
Discord bot
  |
  | validate channel + command input
  v
Automation handler
  |
  | success / failure result
  v
Discord response message
```

1. 사용자가 설정된 Discord 채널에서 slash command를 실행한다.
2. 봇이 요청 채널과 입력값을 검증한다.
3. 봇이 해당 업무 자동화 핸들러를 실행한다.
4. 봇이 성공 결과 또는 실패 사유를 Discord 메시지로 응답한다.

## 7. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| BOT-001 | 설정된 Discord 채널에서 slash command를 수신한다. | P0 |
| BOT-002 | 허용되지 않은 채널의 MVP 명령은 처리하지 않는다. | P0 |
| BOT-003 | 명령 입력값을 검증하고 잘못된 요청에는 명확한 오류를 반환한다. | P0 |
| BOT-004 | 업무 자동화 처리 결과를 Discord 메시지로 반환한다. | P0 |
| BOT-005 | 실패 시 사용자가 다음에 무엇을 해야 하는지 알 수 있게 응답한다. | P0 |

## 8. Deferred Legacy Web Scope

이 저장소에는 이전 웹 앱 목표에서 만든 프론트엔드, 백엔드, 데이터베이스
스캐폴드가 남아 있다. 이 스캐폴드는 참고 자료로 유지하지만, 현재 MVP의 성공
기준은 아니다.

보류된 웹 중심 항목:

1. 회계/회의 웹 메뉴.
2. 브라우저 파일 업로드 화면.
3. 회의 리스트, 상세, 검색, 보고서 화면.
4. 프론트엔드 중심 사용성 요구사항.
5. Android 패키징 경로.

## 9. Acceptance Criteria

1. 문서에서 프로젝트 목표가 Discord bot MVP로 명확히 보인다.
2. MVP 목표가 "Discord 특정 채널에서 slash command로 사용하는 업무 자동화 봇"으로 명시되어 있다.
3. 웹 UI와 프론트엔드 구현은 현재 범위에서 제외 또는 보류로 표시되어 있다.
4. 웹 앱 중심 설명이 현재 MVP 목표와 충돌하지 않는다.

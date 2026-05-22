# Todo PRD

Source: GitHub issue #4 attachment `ExportBlock-bd73c755-7d8a-4bb8-83b2-54b696c1157b.zip`.

Status: active execution PRD for the Todo service documentation track.

## Document Paths and Source of Truth

- Current execution 기준 문서: `docs/prd-todo.md`.
- Legacy 보존 문서: the `Superseded Legacy Web/OCR/Meeting Plan` section in
  this file. It preserves old product context only and is not an active work
  queue.
- Compatibility path: `docs/prd.md` is retained as a pointer to this file so
  older references do not create a second PRD source of truth.
- Decision: keep one Todo PRD source at `docs/prd-todo.md` instead of
  maintaining duplicate content in both `docs/prd.md` and `docs/prd-todo.md`.
  Todo-specific command details remain in the active MVP sections and the Todo
  roadmap section of `docs/todos-todo.md`.

## Current MVP Direction

Activities Todo 문서의 현재 실행 방향은 Discord 특정 채널에서 slash command로
사용하는 업무 자동화 봇이다. 별도 웹 앱, 모바일 패키징, 브라우저
업로드/리포트 화면을 먼저 만들지 않고, 사용자가 이미 일하는 Discord 채널
안에서 최소 비용으로 필요한 자동화 흐름을 검증한다.

전면 수정 사유:

1. 현재 MVP에서 당장 필요한 것은 별도 웹 제품이 아니라 Discord 안에서 실행되는
   작은 자동화 명령이다.
2. 웹 UI, OCR provider, 회의록 분석/검색, 리포트 화면을 동시에 만들면 초기 비용과
   검증 범위가 커진다.
3. Discord bot 우선 접근은 명령 입력, 파일 첨부, 결과 응답을 하나의 채널에서
   검증할 수 있어 운영 비용과 구현 범위를 줄인다.

## Current MVP Goals

1. Discord 특정 채널에서 slash command로 업무 자동화 기능을 실행한다.
2. 명령어 입력, 파일 첨부, 결과 응답을 Discord 안에서 완료한다.
3. SNS, 영수증, Todo 같은 작은 도메인 명령을 단계적으로 추가한다.
4. 처리 결과는 Discord 메시지로 요약하고, 필요한 경우 저장소나 Google Sheets에
   기록한다.
5. 웹 UI 없이도 MVP 핵심 업무 흐름을 검증할 수 있게 한다.

## Current MVP Non-goals

1. React/Vite 기반 웹 앱 구현.
2. 브라우저 기반 영수증 업로드 화면.
3. OCR provider 구현을 전제로 한 영수증 자동 추출.
4. 회의록 업로드, 분석, 검색, 리포트 화면.
5. Capacitor 기반 Android 앱 출시.
6. 자체 LLM 또는 자체 임베딩 서버 운영.
7. 대규모 데이터 파티셔닝, 아카이빙, 멀티 테넌트 조직 관리.

## Current MVP Acceptance Criteria

1. 사용자는 지정된 Discord 채널에서 MVP slash command를 실행할 수 있다.
2. 허용되지 않은 채널의 명령은 도메인 처리 전에 거부된다.
3. 봇은 성공, 검증 실패, 권한 실패, 내부 오류를 Discord 메시지로 명확히 응답한다.
4. 첫 도메인 명령은 외부 provider 없이도 로컬 테스트가 가능하다.
5. 웹/OCR/회의록/리포트 작업은 아래 legacy section에 보존되며 현재 실행 큐와 분리된다.

## Superseded Legacy Web/OCR/Meeting Plan

아래 내용은 기존 웹 앱, OCR, 회의록 분석, 리포트 화면 중심 계획을 보존한 것이다.
현재 MVP 범위가 아니며, 새 Discord bot 방향과 충돌하지 않도록 deferred 상태로
분리한다. future issue가 명시적으로 재활성화하기 전까지 아래 항목은 실행 큐가 아니다.

## Legacy 1. Product Summary

이 섹션은 이전 웹 앱, OCR, 회의록 분석, 검색, 리포트 화면 중심 제품 방향을
보존한다. 아래 legacy 내용의 목표 문장은 현재 실행 지시가 아니라 보류된
범위를 설명하는 archive다.

기존 웹 앱/프론트엔드 중심 목표는 현재 MVP 범위에서 제외하고 보류한다.
React/Vite 프론트엔드와 Capacitor 모바일 패키징은 향후 필요할 때 재검토한다.

## Legacy 2. Goals

The goals below describe the deferred legacy product shape. They must not be
read as current MVP acceptance criteria.

1. 브라우저 또는 모바일 UI에서 영수증 이미지와 회의록 TXT 파일을 업로드한다.
2. 서버가 OCR, 회의록 전처리, 청크 분할, 임베딩, 요약 생성을 처리한다.
3. 회계 영수증 처리, 회의록 요약, 결정사항, 후속업무 후보를 구조화해 저장한다.
4. 웹 UI에서 회의 목록, 상세, 검색, 리포트 화면을 제공한다.
5. 필요 시 Android 패키징과 리포트 출력 흐름을 검토한다.

## Legacy 3. Non-goals for MVP

1. 로그인/권한 관리.
2. Google Spreadsheet 또는 Google Docs 양방향 동기화.
3. Android 앱 출시.
4. 자체 LLM 또는 자체 임베딩 서버 운영.
5. 대규모 데이터 파티셔닝, 아카이빙, 멀티 테넌트 조직 관리.
6. 영수증 승인 워크플로우 전체 구현.
7. 웹 앱/프론트엔드 화면 구현.
8. 브라우저 기반 보고서 출력 화면.

## Legacy 4. Target Users

| User | Need |
| --- | --- |
| 회계 담당자 | Discord 명령어로 영수증 처리와 미지급 건 알림을 자동화한다. |
| 회의 참여자/기록 담당자 | Discord에 회의록 TXT를 첨부하고 요약, 결정사항, 후속업무를 확인한다. |
| 관리자 | 특정 Discord 채널에서 업무 자동화 명령 사용 범위와 결과를 확인한다. |

## Legacy 5. Core User Flows

### 5.1 Accounting Flow

1. 사용자가 지정된 Discord 채널에서 영수증 처리 slash command를 실행하고 이미지를 첨부한다.
2. 봇이 이미지 파일을 수신하고 OCR 처리를 요청한다.
3. 서버가 추출된 비용 데이터를 저장한다.
4. 매일 17시에 미지급 건을 조회한다.
5. 봇이 지정된 Discord 채널 또는 설정된 알림 대상으로 정산/알림 결과를 전달한다.

### 5.2 Meeting Upload Flow

1. 사용자가 지정된 Discord 채널에서 회의록 처리 slash command를 실행하고 TXT 파일을 첨부한다.
2. 봇이 원문 TXT를 수신하고 회의 메타데이터를 생성한다.
3. 서버가 텍스트를 전처리하고 토큰 수를 계산한다.
4. 서버가 회의록을 청크로 분리한다.
5. 서버가 청크별 임베딩을 생성해 저장한다.
6. 서버가 전체 요약, 결정사항, 후속업무 후보를 생성한다.
7. 봇이 처리 상태와 요약 결과를 Discord 메시지로 응답한다.

### 5.3 Meeting Result Flow

1. 사용자가 Discord 명령어로 최근 처리 결과 또는 특정 회의 결과를 요청한다.
2. 봇이 원문 참조, 요약, 결정사항, 후속업무를 Discord 메시지로 표시한다.
3. 긴 결과는 파일 첨부 또는 요약 메시지와 상세 조회 명령으로 분리한다.

### 5.4 Meeting Search Flow

1. 사용자가 Discord slash command에 검색어를 입력한다.
2. 서버가 키워드 검색과 벡터 검색을 조합해 관련 청크를 찾는다.
3. 봇이 관련 회의, 발화자, 시간 구간, 결정사항을 Discord 메시지로 표시한다.

## Legacy 6. Functional Requirements

### 6.1 Discord Bot

| ID | Requirement | Priority |
| --- | --- | --- |
| BOT-001 | 특정 Discord 채널에서만 MVP slash command를 사용할 수 있게 한다. | P0 |
| BOT-002 | 영수증 이미지 첨부를 받는 회계 처리 slash command를 제공한다. | P0 |
| BOT-003 | `.txt` 파일 첨부를 받는 회의록 처리 slash command를 제공한다. | P0 |
| BOT-004 | 처리 시작, 진행 상태, 완료/실패 결과를 Discord 메시지로 응답한다. | P0 |
| BOT-005 | 회의 요약, 결정사항, 후속업무 결과를 Discord에서 조회할 수 있게 한다. | P0 |
| BOT-006 | 회의 검색어를 받는 slash command를 제공한다. | P1 |
| BOT-007 | 긴 결과는 Discord 메시지 제한을 고려해 요약, 첨부 파일, 상세 조회로 나눈다. | P1 |
| BOT-008 | 웹 UI 없이도 핵심 업무 흐름을 사용할 수 있게 한다. | P0 |

### 6.2 Backend

| ID | Requirement | Priority |
| --- | --- | --- |
| BE-001 | Discord 봇에서 전달한 영수증 이미지 파일을 처리한다. | P0 |
| BE-002 | Google Vision API 등 OCR provider 추상화 계층을 제공한다. | P0 |
| BE-003 | OCR 결과를 비용 데이터로 저장한다. | P0 |
| BE-004 | 매일 17시 미지급 건 알림 배치를 실행한다. | P1 |
| BE-005 | Discord 알림을 기본 알림 경로로 사용하고, 이메일 provider는 확장 옵션으로 둔다. | P1 |
| BE-006 | Discord 봇에서 전달한 회의록 TXT 파일을 처리한다. | P0 |
| BE-007 | 회의록 전처리, 토큰 계산, 청크 분할을 수행한다. | P0 |
| BE-008 | 임베딩 생성 provider를 추상화한다. | P0 |
| BE-009 | 회의 요약, 결정사항, 후속업무 후보를 생성한다. | P0 |
| BE-010 | Discord 조회/검색 명령에 필요한 회의 리스트/상세/검색 기능을 제공한다. | P0 |
| BE-011 | Discord 메시지 또는 파일 첨부로 반환할 보고서 데이터를 제공한다. | P1 |

### 6.3 Data

| ID | Requirement | Priority |
| --- | --- | --- |
| DB-001 | PostgreSQL을 기본 저장소로 사용한다. | P0 |
| DB-002 | pgvector로 회의 청크 임베딩을 저장하고 검색한다. | P0 |
| DB-003 | 회의, 참석자, 원문, 청크, 후속업무, 결정사항을 구조화해 저장한다. | P0 |
| DB-004 | 현재 활성 임베딩 모델을 `embedding_configs`로 추적한다. | P0 |
| DB-005 | MVP에서는 `text-embedding-3-small` 기준 `VECTOR(1536)`을 사용한다. | P0 |
| DB-006 | 원문 TXT 파일은 DB 저장을 기본으로 하고, 파일 스토리지는 확장 옵션으로 둔다. | P2 |

## Legacy 7. Recommended Stack

| Layer | Choice | Rationale |
| --- | --- | --- |
| Discord bot | Discord slash commands | 사용자가 실제로 일하는 채널 안에서 업무 자동화를 실행할 수 있다. |
| Backend | Java Spring Boot | multipart 업로드, REST API, scheduled batch, provider 추상화에 적합하다. |
| AI integration | Spring AI boundary | LLM/embedding provider 교체 지점을 명확히 둔다. |
| Database | PostgreSQL + pgvector | 예상 데이터 규모가 작고 벡터 검색까지 한 저장소에서 처리 가능하다. |
| Local infra | Docker Compose | 로컬 DB 실행과 개발 환경 재현에 충분하다. |
| Deferred UI | React + Vite, Capacitor | 웹 UI와 모바일 패키징은 현재 MVP 이후 필요할 때 재검토한다. |

## Legacy 8. Data Volume and Cost Assumptions

| Item | Estimate |
| --- | --- |
| 회의 빈도 | 주 5회 |
| 연간 회의 수 | 약 260회 |
| 회의당 텍스트 | 약 7,000자 / 4,500 tokens |
| 회의당 청크 | 약 10개 |
| 연간 청크 | 약 2,600개 |
| 연간 DB 용량 | 약 33MB |
| 연간 AI API 비용 | 약 $1.30 수준 |

결론: MVP에서는 저장 공간과 API 비용보다 Discord 명령 사용성, 검색 품질, 요약 품질을 우선한다.

## Legacy 9. Acceptance Criteria

1. 사용자는 지정된 Discord 채널에서 회계 처리 slash command를 실행하고 영수증 이미지를 첨부할 수 있다.
2. 사용자는 지정된 Discord 채널에서 회의록 처리 slash command를 실행하고 TXT 파일을 첨부할 수 있다.
3. 봇은 회의록 처리 상태와 완료/실패 결과를 Discord 메시지로 알려준다.
4. 사용자는 Discord에서 요약, 결정사항, 후속업무 후보를 확인할 수 있다.
5. 회의 검색 slash command는 관련 회의/청크/결정사항을 반환한다.
6. 긴 보고서 결과는 Discord 메시지 제한 안에서 읽을 수 있게 요약되거나 파일로 제공된다.
7. `embedding_configs`는 활성 임베딩 모델을 1개만 유지한다.
8. pgvector 컬럼 차원은 실제 사용하는 임베딩 모델 차원과 일치해야 한다.

## Legacy 10. Risks and Decisions

| Topic | Decision |
| --- | --- |
| pgvector dimension | 첨부 문서의 `VECTOR(3072)` 제안은 실제 1536차원 벡터 삽입 시 오류가 나므로 MVP는 `VECTOR(1536)`으로 시작한다. |
| Embedding model migration | 모델 변경 시 별도 마이그레이션과 재임베딩 배치로 처리한다. |
| Google Docs/Sheets | 현재 사용 중인 도구로 고려하되 MVP에서는 직접 연동하지 않는다. |
| Authentication | MVP 범위에서 제외한다. 공개 배포 전 반드시 재검토한다. |
| File storage | 데이터 규모가 작으므로 DB 저장을 기본으로 하고, 필요 시 S3/로컬 파일 스토리지로 분리한다. |
| Web/OCR/meeting roadmap status | 현재 MVP에서는 보류한다. Discord bot 기반 업무 자동화가 먼저 검증된 뒤 future issue로 재검토한다. |

## Legacy 11. MVP Milestones

1. Discord bot MVP: 특정 채널 slash command 등록, 명령 수신, 기본 응답.
2. Meeting schema: Flyway migration, embedding config, meetings/transcripts/chunks/action_items/decisions.
3. Meeting command: TXT 첨부 수신, 전처리, 청크 분할 저장.
4. AI processing: 요약, 결정사항, 후속업무 후보, 임베딩 생성.
5. Discord result/search commands: 처리 상태, 상세 결과, 검색 결과 응답.
6. Accounting command: 영수증 이미지 첨부 수신, OCR 결과 저장, 미지급 알림 배치.

## Legacy 12. Open Questions

1. 영수증 비용 데이터의 최소 필드는 무엇인가? 예: 거래일, 상호, 금액, 통화, 결제수단, 메모.
2. 미지급 알림은 Discord 채널 메시지만으로 충분한가, 이메일도 필요한가?
3. 회의 TXT 파일은 CLOVA Note 형식으로 고정되는가?
4. Discord의 메시지 길이 제한을 넘는 보고서는 파일 첨부로 제공하면 충분한가?
5. 후속업무를 연결할 칸반 테이블 또는 외부 도구가 확정되어 있는가?
6. MVP에서 허용할 Discord 서버/채널 ID는 환경 변수로 고정하면 충분한가?

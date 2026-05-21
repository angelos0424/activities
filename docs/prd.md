# Activities PRD

Source: GitHub issue #4 attachment `ExportBlock-bd73c755-7d8a-4bb8-83b2-54b696c1157b.zip`.

Status: superseded for the current SNS MVP.

## Current MVP Direction

Activities의 현재 실행 방향은 Discord 특정 채널에서 slash command로 사용하는
업무 자동화 봇이다. 별도 웹 앱, 모바일 패키징, 브라우저 업로드/리포트 화면을
먼저 만들지 않고, 사용자가 이미 일하는 Discord 채널 안에서 최소 비용으로
필요한 자동화 흐름을 검증한다.

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
4. 처리 결과는 Discord 메시지로 요약하고, 필요한 경우 저장소나 Google Sheets에 기록한다.
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

Activities는 로그인 없이 사용할 수 있는 소규모 업무 보조 웹 애플리케이션이다. 첫 버전은 회계 영수증 처리와 회의록 요약/검색을 제공하고, 이후 Capacitor 기반 Android 패키징을 고려한다.

## Legacy 2. Goals

1. 회계 담당자가 영수증 이미지를 업로드하면 OCR로 비용 데이터를 추출하고 저장한다.
2. 매일 정해진 시간에 미지급 건을 정산하고 지정 메일로 알림을 보낸다.
3. 회의록 TXT 파일을 업로드하면 AI가 요약, 결정사항, 후속업무를 추출한다.
4. 저장된 회의록과 청크 임베딩을 기반으로 회의 내용, 결정사항, 후속업무를 검색한다.
5. 회의 상세 화면에서 요약 보고서를 확인하고 출력할 수 있다.

## Legacy 3. Non-goals for MVP

1. 로그인/권한 관리.
2. Google Spreadsheet 또는 Google Docs 양방향 동기화.
3. Android 앱 출시.
4. 자체 LLM 또는 자체 임베딩 서버 운영.
5. 대규모 데이터 파티셔닝, 아카이빙, 멀티 테넌트 조직 관리.
6. 영수증 승인 워크플로우 전체 구현.

## Legacy 4. Target Users

| User | Need |
| --- | --- |
| 회계 담당자 | 영수증 이미지를 빠르게 비용 데이터로 저장하고 미지급 건 알림을 자동화한다. |
| 회의 참여자/기록 담당자 | TXT 회의록을 업로드하고 요약, 결정사항, 후속업무를 확인한다. |
| 관리자 | 회의 보고서를 검색, 확인, 출력한다. |

## Legacy 5. Core User Flows

### 5.1 Accounting Flow

1. 사용자가 회계 메뉴에서 영수증 이미지를 업로드한다.
2. 서버가 이미지 파일을 수신하고 OCR 처리를 요청한다.
3. 서버가 추출된 비용 데이터를 저장한다.
4. 매일 17시에 미지급 건을 조회한다.
5. 서버가 지정 메일로 정산/알림 메일을 발송한다.

### 5.2 Meeting Upload Flow

1. 사용자가 회의 메뉴에서 TXT 파일을 업로드한다.
2. 서버가 원문 TXT를 저장하고 회의 메타데이터를 생성한다.
3. 서버가 텍스트를 전처리하고 토큰 수를 계산한다.
4. 서버가 회의록을 청크로 분리한다.
5. 서버가 청크별 임베딩을 생성해 저장한다.
6. 서버가 전체 요약, 결정사항, 후속업무 후보를 생성한다.
7. 사용자가 회의 리스트에서 처리 상태를 확인한다.

### 5.3 Meeting Detail and Report Flow

1. 사용자가 회의 리스트에서 회의를 선택한다.
2. 회의 상세에서 원문, 요약, 결정사항, 후속업무를 확인한다.
3. 사용자가 보고서를 출력하거나 브라우저 인쇄 기능으로 저장한다.

### 5.4 Meeting Search Flow

1. 사용자가 검색어를 입력한다.
2. 서버가 키워드 검색과 벡터 검색을 조합해 관련 청크를 찾는다.
3. UI가 관련 회의, 발화자, 시간 구간, 결정사항을 표시한다.

## Legacy 6. Functional Requirements

### 6.1 Frontend

| ID | Requirement | Priority |
| --- | --- | --- |
| FE-001 | 회계/회의 메뉴를 제공한다. | P0 |
| FE-002 | 회계 메뉴에서 이미지 파일 업로드 입력을 제공한다. | P0 |
| FE-003 | 회의 메뉴에서 `.txt` 파일 업로드 입력을 제공한다. | P0 |
| FE-004 | 회의 리스트를 날짜, 제목, 처리 상태와 함께 표시한다. | P0 |
| FE-005 | 회의 상세 화면에서 요약, 결정사항, 후속업무, 원문을 표시한다. | P0 |
| FE-006 | 회의 검색 입력을 제공한다. | P1 |
| FE-007 | 보고서 확인 및 출력 화면을 제공한다. | P1 |
| FE-008 | 모바일 웹 레이아웃을 지원한다. | P1 |

### 6.2 Backend

| ID | Requirement | Priority |
| --- | --- | --- |
| BE-001 | 영수증 이미지 multipart 업로드 API를 제공한다. | P0 |
| BE-002 | Google Vision API 등 OCR provider 추상화 계층을 제공한다. | P0 |
| BE-003 | OCR 결과를 비용 데이터로 저장한다. | P0 |
| BE-004 | 매일 17시 미지급 건 알림 배치를 실행한다. | P1 |
| BE-005 | Resend API 등 이메일 provider 추상화 계층을 제공한다. | P1 |
| BE-006 | 회의록 TXT multipart 업로드 API를 제공한다. | P0 |
| BE-007 | 회의록 전처리, 토큰 계산, 청크 분할을 수행한다. | P0 |
| BE-008 | 임베딩 생성 provider를 추상화한다. | P0 |
| BE-009 | 회의 요약, 결정사항, 후속업무 후보를 생성한다. | P0 |
| BE-010 | 회의 리스트/상세/검색 API를 제공한다. | P0 |
| BE-011 | 보고서 조회용 API를 제공한다. | P1 |

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
| Frontend | React + Vite | 빠른 웹 클라이언트 개발과 단순 배포에 적합하다. |
| UI | Tailwind CSS + shadcn/ui-style components | 업로드, 리스트, 상세, 보고서 화면을 빠르게 구성할 수 있다. |
| Mobile path | Capacitor | 웹 MVP 이후 Android 패키징 경로를 확보한다. |
| Backend | Java Spring Boot | multipart 업로드, REST API, scheduled batch, provider 추상화에 적합하다. |
| AI integration | Spring AI boundary | LLM/embedding provider 교체 지점을 명확히 둔다. |
| Database | PostgreSQL + pgvector | 예상 데이터 규모가 작고 벡터 검색까지 한 저장소에서 처리 가능하다. |
| Local infra | Docker Compose | 로컬 DB 실행과 개발 환경 재현에 충분하다. |

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

결론: MVP에서는 저장 공간과 API 비용보다 검색 품질, 요약 품질, UI 사용성을 우선한다.

## Legacy 9. Acceptance Criteria

1. 사용자는 회계 메뉴에서 영수증 이미지를 선택할 수 있다.
2. 사용자는 회의 메뉴에서 TXT 파일을 선택할 수 있다.
3. 업로드된 회의록은 회의 리스트에 상태와 함께 표시된다.
4. 회의 상세에서 요약, 결정사항, 후속업무 후보를 확인할 수 있다.
5. 회의 검색은 관련 회의/청크/결정사항을 반환한다.
6. 보고서 화면은 브라우저 인쇄 또는 PDF 저장에 적합한 레이아웃을 제공한다.
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

1. Scaffold: React/Vite, Spring Boot, PostgreSQL + pgvector, Docker Compose.
2. Meeting schema: Flyway migration, embedding config, meetings/transcripts/chunks/action_items/decisions.
3. Meeting upload API: TXT 업로드, 전처리, 청크 분할 저장.
4. AI processing: 요약, 결정사항, 후속업무 후보, 임베딩 생성.
5. Meeting UI: 업로드, 리스트, 상세, 검색, 보고서 출력.
6. Accounting MVP: 영수증 이미지 업로드, OCR 결과 저장, 미지급 알림 배치.

## Legacy 12. Open Questions

1. 영수증 비용 데이터의 최소 필드는 무엇인가? 예: 거래일, 상호, 금액, 통화, 결제수단, 메모.
2. 지정 메일 수신자는 고정 설정인가, 화면에서 변경 가능한가?
3. 회의 TXT 파일은 CLOVA Note 형식으로 고정되는가?
4. 보고서 출력 형식은 브라우저 인쇄면 충분한가, 별도 PDF 생성이 필요한가?
5. 후속업무를 연결할 칸반 테이블 또는 외부 도구가 확정되어 있는가?

# PRD: `receipt-manager` 서비스

## 1. 요약

`receipt-manager` 서비스는 로컬에 설치한 Discord bot을 `#receipt` 채널에서 사용한다. 사용자가 지출자 이름을 입력하면 bot이 Google Sheets의 사람/단체 정보를 찾아 송금 이력 row를 만들고, 영수증 이미지를 로컬 파일시스템에 저장해 정산 대기 상태를 관리한다.

MVP의 핵심은 OCR 정확도보다 "누가 돈을 받아야 하는지, 계좌가 무엇인지, 아직 송금 전인지"를 행정 담당자와 요청자가 쉽게 확인하는 것이다.

## 2. 목표

1. 사용자가 Discord에서 영수증 추가 flow를 시작한다.
2. 입력된 사람/단체명을 Google Sheets에서 검색한다.
3. 검색 결과가 있으면 확인 문구를 보여준다.
4. 검색 결과가 없으면 이름/연락처/선택적 계좌를 받아 새 사람/단체를 추가한다.
5. 송금 이력 spreadsheet에 이름, 계좌번호, 상태 `송금전` row를 만든다.
6. 사용자가 영수증 이미지를 업로드하면 bot이 로컬에 저장한다.
7. `/receipt check` 명령어로 전체 송금 건수와 미완료 건수를 확인한다.
8. slash command로 People/Transfers sheet 주소를 조회하고 변경한다.

## 3. MVP에서 하지 않는 것

1. 자동 송금.
2. 은행 API 연동.
3. 완전한 회계 승인 workflow.
4. 고정밀 OCR 자동 분류.
5. 세무 신고용 회계 장부.
6. KakaoTalk 자동 수집.

## 4. 사용자

| 사용자 | 필요 |
| --- | --- |
| 지출자 | 사비 지출 영수증을 쉽게 제출하고 송금 대기 상태를 남긴다. |
| 송금 확인 담당자 | `/receipt check`로 미완료 송금 건수를 확인하고 행정 담당자에게 follow-up 한다. |
| 행정 담당자 | Google Sheets에서 송금 상태를 `완료`로 변경한다. |
| 총무 | 누락된 영수증과 송금 대기 상태를 확인한다. |

## 5. 사용자 Flow

### 5.1 영수증 추가

1. 사용자가 `#receipt`에서 `/receipt add name:"사람/단체명"`을 입력한다.
2. Bot이 사람/단체 spreadsheet에서 이름을 검색한다.
3. 검색 결과가 있으면 Bot이 정보를 보여주고 "이 사람이 맞나요?"를 묻는다.
4. 사용자가 확인하면 Bot이 송금 이력 spreadsheet에 row를 만든다.
5. 검색 결과가 없으면 Bot이 "없습니다. 새로 추가하시죠"라고 안내한다.
6. Bot이 이름, 연락처, optional 계좌를 입력받는다.
7. Bot이 사람/단체 spreadsheet에 새 row를 추가한다.
8. Bot이 송금 이력 spreadsheet에 이름, 계좌번호, 상태 `송금전` row를 만든다.
9. Bot이 "파일 업로드 해주세요"라고 안내한다.
10. 사용자가 영수증 이미지를 첨부한다.
11. Bot이 이미지를 로컬 저장소에 저장한다.
12. Bot이 로컬 파일 경로와 파일 정보를 송금 이력 row에 연결한다.
13. Bot이 결과 문구를 출력한다.

### 5.2 송금 상태 확인

1. 김석원이 `#receipt`에서 `/receipt check`를 입력한다.
2. Bot이 송금 이력 spreadsheet를 조회한다.
3. Bot이 전체 건수와 `완료`가 아닌 건수를 계산한다.
4. 미완료 건이 있으면 사람/단체명, 금액, 상태, 생성일을 요약한다.
5. 김석원이 행정 담당자에게 follow-up 한다.
6. 행정 담당자가 spreadsheet에서 상태를 `완료`로 변경한다.

### 5.3 Sheet URL 설정

1. 관리자가 Discord에서 `/receipt sheet status`를 입력한다.
2. Bot이 현재 People Sheet와 Transfers Sheet 주소를 보여준다.
3. 관리자가 `/receipt sheet set people:<url> transfers:<url>`을 입력한다.
4. Bot이 URL 또는 Sheet ID를 검증한다.
5. Bot이 SQLite `bot_config`에 sheet 주소를 저장한다.
6. Bot이 다음 `/receipt add`와 `/receipt check`부터 새 sheet를 사용한다.

## 6. Discord UX 요구사항

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| REC-DIS-001 | `#receipt`에서 `/receipt add` 명령어를 제공한다. | P0 |
| REC-DIS-002 | 이름 검색 결과를 확인 버튼과 함께 보여준다. | P0 |
| REC-DIS-003 | 신규 사람/단체 추가 form을 제공한다. | P0 |
| REC-DIS-004 | 영수증 이미지 업로드 안내를 제공한다. | P0 |
| REC-DIS-005 | `#receipt`에서 `/receipt check` 명령어를 제공한다. | P0 |
| REC-DIS-006 | 미완료 송금 건수와 목록을 반환한다. | P0 |
| REC-DIS-007 | sheet 주소 조회/변경 slash command를 제공한다. | P0 |

## 7. Spreadsheet 요구사항

### People Sheet

| Column | 필수 | 메모 |
| --- | --- | --- |
| person_id | yes | generated id |
| type | yes | person, organization |
| name | yes | 검색 key |
| contact | yes | phone/email/free text |
| account | no | bank/account holder/account number |
| created_at | yes | timestamp |
| updated_at | yes | timestamp |

### Transfers Sheet

| Column | 필수 | 메모 |
| --- | --- | --- |
| transfer_id | yes | generated id |
| person_id | yes | linked person/org |
| name | yes | 사람이 읽기 쉽게 복사한 이름 |
| account | no | people sheet에서 복사한 계좌 정보 |
| amount | no | OCR/manual entry가 정의되기 전까지 optional |
| status | yes | 송금전, 완료, 보류 |
| receipt_local_path | no | `data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}` |
| receipt_original_filename | no | 원본 업로드 파일명 |
| receipt_mime_type | no | image MIME type |
| requested_by | yes | Discord user id |
| created_at | yes | timestamp |
| completed_at | no | 수동 입력 또는 향후 sync |

### 로컬 Bot Config

| 필드 | 필수 | 메모 |
| --- | --- | --- |
| people_sheet_url | yes | slash command로 설정 가능 |
| transfers_sheet_url | yes | slash command로 설정 가능 |
| receipt_storage_dir | yes | 기본값 `data/receipts` |
| updated_by | yes | Discord admin user id |
| updated_at | yes | timestamp |

### 로컬 파일 접근 모델

영수증 이미지는 `data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}`에 저장한다. 이 로컬 파일 구조는 추후 Google Drive 동기화 또는 Drive storage adapter로 전환할 가능성을 열어둔다.

MVP에서는 별도 파일 권한 시스템을 만들지 않는다. 로컬 PC의 해당 사용자 계정 또는 파일시스템에 접근할 수 있는 사람이 영수증 이미지에 접근할 수 있는 것으로 본다.

## 8. 기능 요구사항

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| REC-FE-001 | 사람/단체명 fuzzy search를 제공한다. | P0 |
| REC-FE-002 | 검색 결과 확인 interaction을 제공한다. | P0 |
| REC-FE-003 | 신규 사람/단체 row를 추가한다. | P0 |
| REC-FE-004 | 송금 이력 row를 `송금전` 상태로 생성한다. | P0 |
| REC-FE-005 | 영수증 이미지 첨부를 송금 이력에 연결한다. | P0 |
| REC-FE-006 | `/receipt check`가 전체/미완료 건수를 반환한다. | P0 |
| REC-FE-007 | 미완료 목록을 오래된 순으로 보여준다. | P1 |
| REC-FE-008 | 중복 이름 후보가 여러 명이면 선택하게 한다. | P1 |
| REC-FE-009 | 업로드된 영수증 이미지를 로컬 파일시스템에 저장한다. | P0 |
| REC-FE-010 | slash command로 sheet 주소를 조회/변경한다. | P0 |

## 9. 검증 규칙

1. 이름은 필수다.
2. 신규 추가 시 연락처는 필수다.
3. 계좌는 optional이다.
4. 송금 상태는 `송금전`, `완료`, `보류` 중 하나다.
5. `/receipt check`는 `완료`가 아닌 모든 row를 미완료로 본다.
6. 영수증 파일은 image MIME type만 허용한다.
7. 동일 이름이 여러 개면 자동 선택하지 않는다.
8. 저장 경로는 `data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}` 형식을 사용한다.
9. 저장 파일명은 generated id 기반으로 만들고, 사용자 파일명을 경로에 직접 쓰지 않는다.
10. sheet 주소 변경은 관리자 role만 가능하다.
11. 로컬 저장소가 쓰기 불가능하면 receipt add flow를 시작하지 않는다.

## 10. 인수 조건

1. `/receipt add`로 사람/단체를 검색할 수 있다.
2. 검색 결과가 있으면 사용자가 확인 후 송금 이력 row를 만들 수 있다.
3. 검색 결과가 없으면 신규 사람/단체를 추가할 수 있다.
4. 송금 이력 row는 기본 상태 `송금전`으로 생성된다.
5. 사용자는 영수증 이미지를 업로드할 수 있다.
6. Bot은 영수증 이미지를 로컬 파일시스템에 저장하고 그 경로를 송금 이력 row에 기록한다.
7. `/receipt check`는 전체 송금 건수와 미완료 송금 건수를 반환한다.
8. 행정 담당자가 Google Sheets에서 상태를 `완료`로 바꾸면 `/receipt check` 결과에 반영된다.
9. 관리자는 slash command로 sheet 주소를 변경할 수 있다.

## 11. 미결정 사항

1. `/receipt add`, `/receipt check` 명령어를 Discord command group으로 구성할 것인가?
2. 송금 금액은 사용자가 직접 입력하는가, OCR로 추출하는가, 행정 담당자가 Sheet에서 입력하는가?
3. 연락처 형식은 전화번호로 고정할 것인가, 자유 텍스트로 둘 것인가?
4. 계좌 정보는 개인정보이므로 접근 권한과 보관 정책이 필요하다.
5. sheet 주소 변경 권한은 어떤 Discord role에 줄 것인가?

# PRD: Todo and Schedule Service

## 1. Summary

Todo 서비스는 Discord `#todo` 채널에서 일정, 업무 상태, 관련 사람/단체, 결과물 링크/파일을 관리하는 일정 중심 서비스다.

이 서비스는 플랫폼 통합을 위해 Discord bot으로 처리한다. 다만 현재 사용 중인 일정 관리 방법과 불편함을 먼저 확인해야 한다. 잘못 만들면 기존 카카오톡 캘린더보다 힘이 더 들고 불편한 도구가 된다.

## 2. Goals

1. 일정명, 일정내용, 일정 시간, 예상 소요 시간, 위치, 관련 사람/단체를 기록한다.
2. 일정 상태를 wait, progress, done, dismiss 등으로 관리한다.
3. 일정 타입을 회의, 미팅, 사업 등으로 구분한다.
4. 결과물 메모, link, 파일 첨부를 일정에 연결한다.
5. 일정 리스트를 사용자가 이해하기 쉬운 방식으로 정렬한다.
6. 위치가 있는 일정은 지도 앱으로 연결한다.
7. 같은 날짜 일정 간 이동 방법과 예상 이동 시간을 볼 수 있게 한다.
8. `#todo` 채널에서 일정 생성, 목록 확인, 상태 변경을 처리한다.

## 3. Non-goals for MVP

1. 기존 캘린더 전체 대체.
2. 복잡한 프로젝트 관리 도구.
3. 모든 지도/교통수단 지원.
4. 자동 최적 일정 생성.
5. 조직 전체 권한 시스템.
6. 반복 일정 고급 규칙.
7. 초기 버전에서 완전한 캘린더 UI 제공.

## 4. Discovery Required Before Build

Todo는 구현 전에 사용자 요구사항 분석이 필수다.

확인해야 할 질문:

1. 현재 일정 관리는 정확히 어디에서 하는가? KakaoTalk Calendar, Google Calendar, Sheet, 메신저 공지 중 무엇인가?
2. 현재 방식에서 제일 불편한 점은 무엇인가?
3. 누가 일정을 만들고, 누가 확인하고, 누가 완료 처리하는가?
4. 일정 누락이 실제로 어떤 사고를 만들었는가?
5. 이동 시간 계산이 정말 자주 필요한가, 아니면 있으면 좋은 기능인가?
6. 결과물 첨부가 중요한 일정 타입은 무엇인가?
7. Discord 명령만으로 충분한가, 보조 web/mobile UI가 필요한가?

## 5. Users

| User | Need |
| --- | --- |
| 총무/운영 담당자 | 단체 일정을 만들고 진행 상태를 확인한다. |
| 일정 담당자 | 본인이 맡은 일정과 결과물을 업데이트한다. |
| 참여자 | 오늘/이번 주 해야 할 일과 위치를 확인한다. |
| 관리자 | 일정 누락, 지연, 완료 상태를 본다. |

## 6. Core Entities

### Schedule Item

| Field | Required | Notes |
| --- | --- | --- |
| id | yes | internal id |
| title | yes | 일정명 |
| description | no | 일정내용 |
| starts_at | yes | 일정 시작 시간 |
| ends_at | no | 종료 시간 |
| estimated_duration_minutes | no | 예상 소요 시간 |
| location_name | no | 장소명 |
| location_address | no | 주소 |
| related_party_id | no | 사람 or 단체 |
| type | yes | meeting, meetup, project, admin, other |
| status | yes | wait, progress, done, dismiss |
| result_note | no | 결과물 메모 |
| result_link | no | 결과물 링크 |
| attachment_url | no | 파일 첨부 |
| created_by | yes | creator |
| created_at | yes | timestamp |
| updated_at | yes | timestamp |

### Related Party

| Field | Required | Notes |
| --- | --- | --- |
| id | yes | internal id |
| name | yes | person/org name |
| type | yes | person, organization |
| contact | no | phone/email/etc |

## 7. User Flow

### 7.1 Create Schedule

1. 사용자가 `#todo`에서 `/todo add`를 입력한다.
2. Bot이 일정 입력 modal/form을 연다.
3. 사용자가 일정명을 입력한다.
4. 사용자가 일정내용을 입력한다.
5. 사용자가 일정 시간과 예상 소요 시간을 입력한다.
6. 사용자가 위치를 입력한다.
7. 사용자가 관련 사람/단체를 선택한다.
8. 사용자가 일정 타입을 선택한다.
9. 기본 상태는 `wait`로 저장된다.

### 7.2 Manage Status

1. 사용자가 `#todo`에서 `/todo list`로 일정 리스트를 본다.
2. 사용자가 `/todo status` 또는 버튼으로 상태를 `progress`로 변경한다.
3. 일정 완료 후 결과물 메모/link/file을 첨부한다.
4. 사용자가 상태를 `done`으로 변경한다.
5. 취소/제외된 일정은 `dismiss`로 변경한다.

### 7.3 Route and Travel Time

1. 사용자가 위치가 있는 일정을 연다.
2. Bot이 지도 링크 버튼을 보여준다.
3. 네이버 지도 등 외부 지도 앱으로 이동한다.
4. 같은 날짜에 위치가 있는 일정이 여러 개면 시스템이 이동 시간 후보를 보여준다.

## 8. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| TODO-FE-001 | 일정 생성 form을 제공한다. | P0 |
| TODO-FE-002 | `#todo`에서 `/todo list`를 제공한다. | P0 |
| TODO-FE-003 | `/todo status` 또는 버튼으로 상태 변경을 제공한다. | P0 |
| TODO-FE-004 | 일정 타입 필터를 제공한다. | P1 |
| TODO-FE-005 | 결과물 메모/link/file 첨부를 제공한다. | P1 |
| TODO-FE-006 | Discord message의 지도 링크 버튼으로 지도 앱에 연결한다. | P1 |
| TODO-FE-007 | 같은 날짜 일정의 예상 이동 시간을 보여준다. | P2 |
| TODO-FE-008 | 사람/단체 연결을 제공한다. | P1 |

## 9. Sorting Requirements

초기 리스트 정렬 후보:

1. 오늘 일정 먼저.
2. 시작 시간이 가까운 순.
3. 상태가 `wait` 또는 `progress`인 일정 먼저.
4. `done`과 `dismiss`는 아래로 내림.
5. 같은 날짜 안에서는 시작 시간순.

정렬은 사용자 관찰 후 확정한다.

## 10. Map Requirements

MVP:

1. 위치/주소를 저장한다.
2. 네이버 지도 검색 URL 또는 앱 deep link로 연결한다.

Later:

1. Naver Cloud Directions API로 이동 시간과 경로 정보를 조회한다.
2. 같은 날짜 일정 간 이동 시간을 계산한다.
3. 예상 소요 시간과 이동 시간을 합쳐 하루 일정 부담을 보여준다.

## 11. Acceptance Criteria

1. 사용자는 일정명, 내용, 시간, 예상 소요 시간, 위치, 관련 사람/단체를 저장할 수 있다.
2. 사용자는 일정 상태를 변경할 수 있다.
3. 사용자는 일정 타입을 지정할 수 있다.
4. 사용자는 결과물 메모 또는 링크를 남길 수 있다.
5. 일정 리스트는 오늘/미완료 중심으로 정렬된다.
6. 위치가 있는 일정은 지도 앱으로 이동할 수 있다.
7. `#todo`에서 일정 생성, 조회, 상태 변경이 가능하다.

## 12. Risks

1. 기존 일정 관리보다 입력이 많아지면 실패한다.
2. 이동 시간 계산은 구현 비용이 높고 실제 빈도가 낮을 수 있다.
3. DB를 먼저 만들면 요구사항이 틀렸을 때 수정 비용이 커진다.
4. Todo가 SNS/영수증보다 넓어서 제품 초점이 흐려질 수 있다.

## 13. Open Questions

1. 현재 사용하는 일정 관리 방법은 무엇인가?
2. 기존 방식에서 가장 불편한 점은 무엇인가?
3. 일정의 owner가 필요한가?
4. 관련 사람/단체 데이터는 영수증 서비스의 People Sheet와 공유할 것인가?
5. 지도는 네이버 지도만 지원하면 되는가?
6. 앱 API로 이동 방법/시간을 가져오는 것이 MVP에 꼭 필요한가?
7. Discord message로 긴 일정 목록을 보여줄 때 pagination이 필요한가?

## 14. References

- Naver Cloud Directions API can return driving route, duration, distance, toll, and related route data: https://api.ncloud-docs.com/docs/en/ai-naver-mapsdirections-driving

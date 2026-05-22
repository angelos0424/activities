# activities Issue Workflow

## 1. 필수 원칙

1. 이 저장소에 이슈를 만들 때는 항상 이 문서(`WORKFLOW.md`)를 먼저 확인한다.
2. 이슈 제목은 반드시 허용된 title prefix 조합으로 시작한다.
3. 이슈에는 반드시 prefix와 대응되는 GitHub label을 붙인다.
4. Symphony가 구현해도 되는 이슈와 논의용 이슈를 title prefix, label, 본문 문구, Project 상태로 동시에 구분한다.

## 2. 서비스 prefix와 label

이슈는 정확히 하나의 서비스 prefix와 동일한 서비스 label을 가져야 한다.

| 서비스 | title prefix | 필수 label | 기본 허용 경로 |
| --- | --- | --- | --- |
| SNS / Discord bot | `[sns]` | `sns` | `sns/**` |
| Recipe / receipt flow | `[recipe]` | `recipe` | `recipe/**` |
| Todo flow | `[todo]` | `todo` | `todo/**` |

규칙:

- 서비스 prefix가 없는 이슈는 Symphony 실행 대상이 아니다.
- 서비스 label이 없거나 prefix와 label이 다르면 이슈를 실행하지 않는다.
- 공유/루트 파일 변경이 필요하면 이슈 본문과 PR 본문에 이유를 명시한다.

## 3. 작업 유형 prefix와 label

서비스 prefix 뒤에는 정확히 하나의 작업 유형 prefix를 붙인다.

| 유형 | title prefix | 필수 label | 용도 | Symphony 구현 여부 |
| --- | --- | --- | --- | --- |
| Planning | `[planning]` | `planning` | 요구사항 정리, 설계 논의, 의사결정 | 구현 금지 |
| Task | `[task]` | `task` | 구현 가능한 실행 작업 | Todo/In Progress일 때만 구현 가능 |
| Bug | `[bug]` | `bug` | 결함 수정 | Todo/In Progress일 때만 구현 가능 |
| Docs | `[docs]` | `documentation` | 문서 작성/수정 | Todo/In Progress일 때만 구현 가능 |

예시:

- `[sns][planning] Discord bot 권한 정책 논의`
- `[sns][task] Discord bot skeleton 추가`
- `[recipe][bug] 영수증 파싱 실패 수정`
- `[todo][docs] Todo 명령어 사용법 정리`

## 4. title 형식

```text
[service][type] 짧은 작업 제목
```

허용 예:

```text
[sns][planning] Discord bot MVP 범위 확정
[sns][task] Discord slash command scaffold 추가
[recipe][bug] 영수증 업로드 검증 오류 수정
[todo][docs] Todo workflow 문서화
```

금지 예:

```text
[Task] Discord bot 만들기
[sns] Discord bot 만들기
[planning] Discord bot 논의
Discord bot 만들기
```

## 5. label 강제 규칙

이슈 생성 시 다음 label 조합을 반드시 지정한다.

1. 서비스 label 1개: `sns`, `recipe`, `todo` 중 정확히 하나
2. 작업 유형 label 1개: `planning`, `task`, `bug`, `documentation` 중 정확히 하나

예:

- `[sns][planning] ...` → labels: `sns`, `planning`
- `[sns][task] ...` → labels: `sns`, `task`
- `[recipe][bug] ...` → labels: `recipe`, `bug`
- `[todo][docs] ...` → labels: `todo`, `documentation`

label이 빠져 있거나 title prefix와 일치하지 않으면 먼저 이슈를 수정한 뒤 진행한다.

## 6. Project 상태별 운영 기준

| 상태 | 용도 | Symphony 처리 기준 |
| --- | --- | --- |
| `Backlog` | 아이디어, 후보 작업, 실행 여부 미확정 | 실행하지 않는다. |
| `Ready` | 논의 중이거나 요구사항을 다듬는 작업 | 실행하지 않는다. |
| `Todo` | 지금 실행해도 되는 작업 | 실행 대상으로 본다. 한 번에 하나만 둔다. |
| `In Progress` | 현재 작업 중인 이슈 | 현재 작업만 이어간다. |
| `In Review` / `Done` | PR 검토 중이거나 완료된 이슈 | 새 작업을 시작하지 않는다. |

## 7. 논의용 이슈 규칙

논의용 이슈는 반드시 다음 형식을 사용한다.

```text
[sns][planning] 제목
```

서비스에 따라 `[recipe][planning]`, `[todo][planning]`도 가능하다.

필수 조건:

- labels: 서비스 label + `planning`
- Project 상태: `Backlog` 또는 `Ready`
- 본문 상단에 다음 문구 포함

```text
Planning Only / Do not implement yet
```

이 문구가 있는 이슈에서는 요구사항 정리, 설계 검토, 질문 답변, 범위 조정만 허용한다. 코드 작성, 파일 수정, 브랜치 생성, 커밋, PR 생성은 하지 않는다.

## 8. 실행용 이슈 규칙

실행용 이슈는 `[service][task]`, `[service][bug]`, `[service][docs]` 중 하나를 사용한다.

`Todo`로 올리기 전에 다음을 확인한다.

1. title prefix와 label이 일치한다.
2. 작업 범위가 명확하다.
3. 수정 가능한 경로와 서비스 경계가 명확하다.
4. 완료 조건과 검증 방법이 적혀 있다.
5. `Planning Only / Do not implement yet` 문구가 없다.
6. 현재 `Todo`가 비어 있다.

`Todo`에는 한 번에 하나의 실행용 이슈만 둔다.

## 9. 이슈 작성 템플릿 체크리스트

이슈를 올릴 때마다 다음 순서로 확인한다.

1. `WORKFLOW.md`를 읽고 최신 prefix/label 규칙을 확인한다.
2. 제목을 `[service][type] 제목` 형식으로 작성한다.
3. 서비스 label과 작업 유형 label을 모두 지정한다.
4. 논의용이면 `Planning Only / Do not implement yet`를 본문 상단에 적고 `Backlog` 또는 `Ready`에 둔다.
5. 실행용이면 완료 조건, 검증 방법, 허용 경로, `Target-Branch`를 적는다.
6. 실행용을 `Todo`로 올리기 전 기존 `Todo`가 비어 있는지 확인한다.

## 10. PR 규칙

실행 이슈를 처리한 PR은 다음을 지킨다.

- PR 제목에도 동일한 서비스 prefix를 포함한다.
- PR 본문에 `Closes #<issue-number>`를 포함한다.
- 변경 파일과 검증 결과를 요약한다.
- 공유/루트 파일을 변경했다면 이유를 명시한다.

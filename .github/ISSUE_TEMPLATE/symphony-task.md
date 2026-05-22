---
name: Symphony Service Task
about: WORKFLOW.md 기준으로 SymphonyEx가 처리할 activities 이슈
title: "[sns][planning] "
labels: "sns,planning"
assignees: ""
---

> 이슈 작성 전 반드시 `WORKFLOW.md`를 확인하세요.
> 기본값은 안전한 논의용 이슈입니다. 실행용이면 title prefix와 labels를 함께 변경하세요.

## Workflow 체크
- [ ] `WORKFLOW.md`의 title prefix / label 규칙을 확인했다.
- [ ] 제목은 `[service][type] 제목` 형식이다.
- [ ] 서비스 label 1개(`sns`, `recipe`, `todo`)를 지정했다.
- [ ] 작업 유형 label 1개(`planning`, `task`, `bug`, `documentation`)를 지정했다.

## 요청
<!-- 무엇을 논의/구현/수정할지 적어주세요 -->

## 작업 범위
- <!-- 구체 작업을 적어주세요 -->

## 산출물
- <!-- 추가/수정될 기능 또는 파일을 적어주세요 -->

## 완료 조건
- 대상 서비스 prefix로 브랜치 생성 후 커밋
- PR 생성
- PR 제목에 동일한 서비스 prefix 포함: `[sns]`, `[recipe]`, `[todo]`
- PR 본문에 `Closes #<issue-number>` 포함
- 검증 결과 요약

## 제약
- 이슈 생성/수정 전 `WORKFLOW.md`를 반드시 확인
- 이슈 제목은 반드시 `[sns][planning]`, `[sns][task]`처럼 `[service][type]`으로 시작
- GitHub label은 title prefix와 일치하도록 서비스 label + 작업 유형 label을 모두 지정
- 논의용 이슈는 `planning` label과 `Planning Only / Do not implement yet` 문구를 포함하고 `Todo`로 올리지 않음
- 지정된 서비스 폴더 외 변경 금지
- 공통/루트 파일 변경 시 PR 본문에 이유 명시
- 다른 서비스 동작 변경 금지

Service: <sns | recipe | todo>
Type: <planning | task | bug | docs>

Paths:
- <sns/** | recipe/** | todo/**>

Target-Branch: main

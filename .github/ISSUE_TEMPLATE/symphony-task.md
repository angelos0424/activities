---
name: Symphony Issue
about: 현재 SymphonyEx가 읽을 수 있는 activities 이슈 템플릿
title: "[sns][planning] "
labels: "sns,planning"
assignees: ""
---

<!--
필수: 이슈 작성/수정 전 WORKFLOW.md를 먼저 확인하세요.
현재 SymphonyEx는 이슈 본문의 plain metadata 라인을 읽습니다.
아래 Service / Paths / Target-Branch 라인의 이름을 바꾸거나 삭제하지 마세요.
-->

Planning Only / Do not implement yet

## Workflow 체크
- [ ] `WORKFLOW.md`를 확인했다.
- [ ] 제목이 `[service][type] 제목` 형식이다. 예: `[sns][planning]`, `[sns][task]`
- [ ] 서비스 label 1개를 지정했다: `sns`, `recipe`, `todo`
- [ ] 작업 유형 label 1개를 지정했다: `planning`, `task`, `bug`, `documentation`
- [ ] 실행용 이슈라면 `Planning Only / Do not implement yet` 문구를 제거했다.
- [ ] 실행용 이슈라면 Project `Todo`가 비어 있는지 확인했다.

## 요청
<!-- 무엇을 논의/구현/수정할지 적어주세요. -->

## 작업 범위
- <!-- 구체 작업 -->

## 산출물
- <!-- 추가/수정될 기능 또는 파일 -->

## 완료 조건
- 대상 브랜치에서 작업 브랜치 생성
- 필요한 변경 커밋
- 원격 브랜치 push
- PR 생성
- PR 제목에 동일한 서비스 prefix 포함: `[sns]`, `[recipe]`, `[todo]`
- PR 본문에 `Closes #<issue-number>` 포함
- 검증 결과 요약

## 제약
- 이슈 생성/수정 전 `WORKFLOW.md` 확인 필수
- title prefix와 label이 반드시 일치해야 함
- 지정된 서비스 폴더 외 변경 금지
- 공통/루트 파일 변경 시 PR 본문에 이유 명시
- 다른 서비스 동작 변경 금지
- 논의용 이슈는 `Backlog` 또는 `Ready`에 두고 `Todo`로 올리지 않음

## Symphony Metadata
Service: sns
Paths:
- sns/**
Target-Branch: main

<!--
서비스별 값:
- sns:    Service: sns,    Paths: sns/**
- recipe: Service: recipe, Paths: recipe/**
- todo:   Service: todo,   Paths: todo/**

작업 유형별 title/label:
- planning: title `[service][planning]`, label `planning`, 구현 금지
- task:     title `[service][task]`,     label `task`, 실행 가능
- bug:      title `[service][bug]`,      label `bug`, 실행 가능
- docs:     title `[service][docs]`,     label `documentation`, 실행 가능
-->

## Existing PR Follow-up 전용
<!-- 기존 PR 후속 작업일 때만 아래 값을 채우세요. 신규 작업이면 비워둡니다. -->
Target-PR:
Target-Branch:
Existing PR:

---
name: Symphony Service Task
about: SymphonyEx가 처리할 sns / recipe / todo 서비스 작업 이슈
title: "[sns | recipe | todo] "
labels: ""
assignees: ""
---

## 요청
<!-- 무엇을 구현/수정할지 적어주세요 -->

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
- 이슈 제목은 반드시 `[sns]`, `[recipe]`, `[todo]` 중 하나로 시작
- GitHub label도 동일하게 `sns`, `recipe`, `todo` 중 하나를 지정
- 지정된 서비스 폴더 외 변경 금지
- 공통/루트 파일 변경 시 PR 본문에 이유 명시
- 다른 서비스 동작 변경 금지

Service: <sns | recipe | todo>

Paths:
- `sns/**` 또는 `recipe/**` 또는 `todo/**`

Target-Branch: main

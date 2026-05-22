# 스택 리뷰

> Legacy note: 이 리뷰는 이전 회계/회의록 범위에서 나온 내용이다.
> 현재 MVP 방향은 `docs/tech-stack.md`의 로컬 Discord bot stack이다.

출처: GitHub issue #4 첨부 파일 `ExportBlock-bd73c755-7d8a-4bb8-83b2-54b696c1157b.zip`.

## 결론

제안된 스택은 당시 요청된 회계 및 회의 업무 흐름에는 타당했다.

- React + Vite는 web client 기반으로 실용적이다.
- Tailwind CSS와 shadcn/ui 스타일 component는 upload/list/detail/report UI에 맞는다.
- Capacitor는 이후 Android packaging 경로로 합리적이다. 첫 버전은 responsive web app으로 출시할 수 있기 때문이다.
- Spring Boot는 multipart upload, scheduled job, REST API, AI integration boundary에 적합하다.
- PostgreSQL + pgvector는 예상 회의량에 충분하다. 첨부 문서의 추산은 연간 약 2,600개 chunk로, 작은 규모다.
- Docker Compose는 로컬 database setup에 충분하다.

## Scaffold 결정

넓은 product implementation 대신 작은 full-stack scaffold만 만들었다.

```text
browser
  |
  | REST / multipart upload
  v
Spring Boot API
  |
  | Flyway migration
  v
PostgreSQL + pgvector
```

## 적용한 보정

첨부 문서는 `embedding VECTOR(3072)`를 제안했지만, OpenAI `text-embedding-3-small`
embedding은 1536차원이다. pgvector는 선언한 차원을 강제하므로 1536차원 vector를
`VECTOR(3072)` column에 넣을 수 없다.

초기 migration은 seed된 active embedding model이 `text-embedding-3-small`이므로
`VECTOR(1536)`을 사용한다. 나중에 embedding model이 바뀌면 아래 중 하나를 명시적으로
선택해 migration해야 한다.

1. `transcript_chunks_3072`처럼 model별 chunk table을 추가한다.
2. 계획된 re-embedding migration과 함께 column dimension을 변경한다.
3. 여러 차원을 동시에 저장해야 할 필요가 생기면 unbounded `VECTOR` column과 model별 expression index를 사용한다.

현재처럼 작은 규모의 시스템에서는 첫 버전을 단순하게 유지한다. 하나의 active embedding model과 하나의 fixed-dimension indexed column이면 충분하다.

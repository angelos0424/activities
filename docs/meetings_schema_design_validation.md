# meetings_schema_design.md 검증 결과

검증 대상: GitHub issue #2 첨부 파일 `meetings_schema_design.md`

검증일: 2026-05-19

## 결론

첨부 문서는 전체 방향성은 작고 단순한 회의록/RAG 저장소에 맞지만, 최종 DDL은 그대로 적용하면 안 된다.

특히 `transcript_chunks.embedding VECTOR(3072)` 설계가 문서의 핵심 전제와 맞지 않는다. pgvector에서 서로 다른 차원의 벡터를 같은 컬럼에 저장하려면 `vector(n)`이 아니라 차원 미지정 `vector` 타입을 써야 하며, 인덱스도 동일 차원 행에 대한 partial/expression index로 나누어야 한다. 또한 일반 `vector` 인덱스는 2,000차원을 넘는 경우 별도 전략이 필요하므로, `VECTOR(3072)` 컬럼에 `ivfflat (embedding vector_cosine_ops)`를 바로 거는 DDL은 위험하다.

## 주요 검증 항목

| 항목 | 판정 | 근거 |
| --- | --- | --- |
| OpenAI `text-embedding-3-small` 차원/비용 | 적합 | OpenAI 문서 기준 기본 1,536차원, $0.02/1M tokens |
| OpenAI `text-embedding-3-large` 차원/비용 | 적합 | OpenAI 문서 기준 기본 3,072차원, $0.13/1M tokens |
| GPT-4o-mini 요약/검색 비용 계산 | 대체로 적합 | OpenAI 가격표 기준 입력 $0.15/1M, 출력 $0.60/1M tokens |
| 저장 용량 산정 | 대체로 적합 | pgvector `vector` 저장량은 `4 * dimensions + 8` bytes라 문서 계산과 큰 차이 없음 |
| `VECTOR(3072)`에 1,536차원 벡터 저장 가능 주장 | 부적합 | `vector(n)`은 고정 차원 타입이다. mixed dimension 저장은 차원 미지정 `vector` 타입을 사용해야 한다 |
| `VECTOR(3072)` + 일반 IVFFlat 인덱스 | 부적합 | pgvector는 2,000차원을 넘는 벡터 인덱싱에 halfvec, binary quantization, subvector 같은 대안을 안내한다 |
| `embedding_configs`로 모델 메타데이터 추적 | 적합 | 모델명, provider, dimensions, active 상태 추적은 재임베딩 운영에 유용하다 |
| `updated_at` 컬럼 | 보완 필요 | 컬럼은 있으나 자동 갱신 trigger/function이 DDL에 없다 |

## 수정 권장안

### 권장안 A: 현재 규모에 맞춘 단순 설계

초기 모델을 `text-embedding-3-small`로 정하고 `VECTOR(1536)`을 사용한다.

```sql
embedding VECTOR(1536)
```

장점:
- 최종 DDL이 단순하다.
- IVFFlat/HNSW 인덱스 구성이 자연스럽다.
- 문서의 비용/용량 전제와 가장 잘 맞는다.

단점:
- 1,024차원 또는 3,072차원 모델로 바꾸면 DDL 또는 테이블 재구성이 필요하다.

현재 문서가 산정한 규모는 1년 약 2,600청크뿐이므로, 모델 교체 시 재임베딩/마이그레이션 비용이 작다. 따라서 이 선택이 가장 실용적이다.

### 권장안 B: 모델별 차원 혼합을 진짜로 지원

차원 미지정 `vector` 컬럼을 쓰고, 활성 모델별 partial index를 만든다.

```sql
embedding vector

CREATE INDEX idx_chunks_embedding_1536
    ON meetings.transcript_chunks
    USING hnsw ((embedding::vector(1536)) vector_cosine_ops)
    WHERE embedding_config_id = '<1536-model-config-id>';
```

장점:
- 여러 임베딩 차원을 한 테이블에 보관할 수 있다.
- 모델별 검색 인덱스를 분리할 수 있다.

단점:
- 쿼리와 마이그레이션이 복잡해진다.
- `embedding_config_id`별 partial index 관리가 필요하다.

현재 요구 규모에서는 이 복잡도는 과하다. 모델 A/B 테스트나 장기간 다중 모델 공존이 실제 요구사항일 때만 선택하는 것이 맞다.

### 3,072차원 모델을 실제로 인덱싱해야 하는 경우

`text-embedding-3-large` 기본 3,072차원을 그대로 쓸 계획이면 일반 `vector` 인덱스 대신 pgvector가 안내하는 2,000차원 초과 인덱싱 전략을 검토해야 한다.

예:
- `halfvec` 또는 half-precision expression index
- binary quantization
- subvector index 후 full vector rerank
- OpenAI embeddings API의 `dimensions` 파라미터로 2,000 이하 차원으로 축소

## 최종 판정

첨부 파일은 설계 설명 자료로는 참고 가능하지만, 최종 DDL은 수정 없이 승인하면 안 된다.

PR 또는 구현 계획에 반영할 최소 변경은 다음 중 하나다.

1. 단순 운영을 우선하면 `embedding VECTOR(1536)`으로 바꾸고 모델 변경 시 명시적 마이그레이션을 허용한다.
2. 다중 차원 모델 공존이 필요하면 `embedding vector`와 모델별 partial/expression index 설계로 바꾼다.

## 참고 자료

- pgvector README: https://github.com/pgvector/pgvector
- pgvector mixed dimensions FAQ: https://github.com/pgvector/pgvector#can-i-store-vectors-with-different-dimensions-in-the-same-column
- OpenAI embeddings guide: https://platform.openai.com/docs/guides/embeddings
- OpenAI pricing: https://platform.openai.com/docs/pricing

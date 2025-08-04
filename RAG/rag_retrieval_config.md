````markdown
# RAG Retrieval Config – OpenObserve Assistant  
`/RAG/rag_retrieval_config.md`

---

## 1. Overview

This file defines the retrieval configuration and scoring rules used by the Milvus-based RAG system to power dashboard example retrieval and prompt grounding.

It also defines fallback behavior and prompt enhancers such as per-index `top_queries`.

---

## 2. Chunk Scoring Formula

```ts
rag_score = cosine_similarity
          + (index_match ? 0.1 : 0)
          - token_overlap_penalty
````

### Components:

* `cosine_similarity`: Primary vector match score from embedding model
* `index_match`: +0.1 bonus if chunk comes from same index as user-selected stream
* `token_overlap_penalty`: Reduces score if chunk is overly verbose or redundant

---

## 3. Scoring Thresholds

| Rule                 | Value                             |
| -------------------- | --------------------------------- |
| Min score to accept  | 0.82                              |
| Fallback if no match | ✅ Retry once with rephrased query |
| Retry threshold      | Still 0.82 (do not loosen)        |
| Max retries          | 1                                 |

---

## 4. Chunk Filters

All retrieval is filtered by:

```json
{
  "index": "<selected stream>",
  "deployment": "<openobserve env>"
}
```

Optional filters (not enabled in MVP):

* `tags`
* `panel_type`
* `priority_score`

---

## 5. Top Query Injection

For each index, the system maintains a file of up to 10 curated or frequently observed queries representative of that index’s usage.

**Location:**
`/retrieval/index_queries/{index}.top_queries.json`

**Example Format:**

```json
{
  "index": "walmart_web_analytics",
  "top_queries": [
    "What is the error rate on cart page?",
    "How many ATC failures happened yesterday?",
    "Show 5xx trends for the PDP page"
  ]
}
```

---

### Injection Behavior:

* These queries are injected into the prompt **as-is** whenever the user selects a stream (index)
* They are **not retrieved dynamically** or scored
* They serve as semantic background to inform the LLM what kinds of questions are common on that stream

Prompt example:

> Other common queries on this stream:
>
> * What is the error rate on cart page?
> * How many ATC failures happened yesterday?
> * Show 5xx trends for the PDP page

If token budget is tight, limit to 5. Otherwise inject full 10.

---

## 6. Maintenance Rules

* Top queries are generated weekly from query logs
* Duplicates removed via semantic clustering
* Chunks and top queries should stay aligned to avoid drift

---

```
```

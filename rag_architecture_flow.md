````markdown
## RAG Architecture: End-to-End System Flow (Reviewed by Rishi, Sandeep, Yogi)

---

## 1. Overview

This document outlines the finalized architecture, flow, and subsystem responsibilities of the RAG-based analytics query assistant for OpenObserve, based on outputs from planning and requirements phase artifacts. The system separates concerns across schema retrieval, example-based learning, query generation, and fallback handling.

---

## 2. High-Level Flow

### User Interaction

1. User submits a natural language query (e.g., "What is the ATC error rate on search page?")
2. The system embeds the query and routes it to two separate Milvus-backed RAGs:
   - **RAG 1: Schema Field Index**
   - **RAG 2: SQL + VRL Example Index**

> ✅ These RAGs are invoked in **parallel**.

### Retrieval

3. Top `k` chunks are retrieved from both RAGs with cosine similarity scoring.
4. Each chunk includes metadata (e.g., `page_nm`, `field`, `metric`, `has_vrl`)
5. A post-RAG **composite scoring layer** refines relevance:

```ts
rag_score = cosine_similarity
          + (index_match ? 0.1 : 0)
          - (token_overlap_penalty)
````

6. **Example Query RAG**

   * Top **3** example queries are always injected into the prompt.

7. **Schema RAG** fallback logic:

```ts
if (top_schema_match_score < threshold) {
  inject_full_schema_for(user_selected_index)
} else {
  inject_field_subset = top_k_fields_from(user_selected_index)
}
```

Thresholds are environment-configurable.

### Prompt Construction

8. Prompt is assembled with distinct sections:

   * **User Intent**
   * **Schema Reference** (from RAG 1)
   * **Example Queries** (from RAG 2)
   * **System Instructions** (e.g., rewrite query using `page_nm = 'search'`)

### LLM Response

9. LLM generates a grounded **SQL + VRL query** aligned to user intent. Both are always generated.
10. Output is checked for:

    * Correct field substitution
    * Valid syntax
    * Schema alignment

### Output Handling

11. Response is:

    * Shown to user with inline metadata tags and confidence note
    * Logged for telemetry, fallback tracking, and RAG improvement

---

## 3. System Components

### 🔹 Milvus Collections (RAG Layer)

* `schema_field_rag`
* `example_query_rag`

Each uses:

* Custom chunking strategy
* Field-specific metadata tagging
* Cosine similarity
* Independent scoring thresholds
* Composite score reranker (as above)

### 🔹 RAG Orchestrator

* Embeds query once
* Calls both collections in parallel
* Applies composite scoring
* Filters and tags chunks
* Builds final prompt with top 3 examples + schema subset/full fallback

### 🔹 Prompt Generator

* Strict prompt scaffolding using template blocks
* Separates schema vs. example contexts
* Injects safety instructions ("do not copy if page mismatch")
* Tracks `prompt_id`, `included_chunks`, and `token_budget`
* **Always generates both SQL and VRL**

### 🔹 Validator

* Checks for field substitution accuracy
* Validates presence of requested `page_nm`, `metric`
* Flags hallucinations or mismatches for feedback ingestion

### 🔹 UI Layer (Yogi)

* States: success, fallback, partial match, no match
* Confidence score pill + explanation
* Previewable natural-language summary and raw SQL

---

## 4. Edge-Case Handling

* **No match from schema RAG** → use fallback template + expose schema hints
* **Too many matches from example RAG** → rank by overlap + cap tokens
* **Substitution mismatch** → tag as `low-confidence` and prompt user
* **Unrecognized fields** → fallback UI suggestion + log for analyst triage

---

## 5. Future Considerations

* 🔍 Define PromptTemplate DSL to standardize construction
* 🧪 Build test harness to simulate RAG + LLM flow for correctness validation
* 📉 Instrument LLM success/failure with feedback hooks and telemetry
* 🗂️ Handle schema evolution with versioning, conflict flags, and reindexing
* ⚖️ Add source prioritization for duplicated schema fields

---

## 6. Feedback Loop Integration

### 🔹 Feedback Capture Points

| Point in Flow            | Mechanism                            |
| ------------------------ | ------------------------------------ |
| After LLM response       | Thumbs up/down + optional comment UI |
| On wrong query detection | User tags incorrect field or page    |
| From analyst review      | Manual tagging of mismatches         |

### 🔹 Feedback Types

| Type              | Target Component      | Action                                 |
| ----------------- | --------------------- | -------------------------------------- |
| Field mismatch    | Schema RAG            | Flag chunk for correction or weighting |
| Incorrect SQL     | Example RAG           | Mark sample for retraining or deletion |
| Prompt failure    | Prompt template logic | Adjust fallback scaffolding            |
| Repeated fallback | Retrieval engine      | Lower threshold or re-index            |

### 🔹 Processing & Routing

1. Feedback written to `feedback_events` table or queue
2. Events are periodically aggregated into:

   * **Misfire logs** (e.g. top recurring failure fields)
   * **Chunk downgrade list**
   * **Retrieval rule refinements**
3. Analyst or auto-cron reviews apply updates:

   * Re-rank vectors
   * Patch metadata
   * Mark examples as deprecated

### 🔹 Impact on System Behavior

* Improves future retrieval relevance
* Reduces hallucination recurrence
* Enables "learning from user signals" loop without retraining the LLM

---

## 7. Schema Field Definition & Indexing

### 🔹 Source of Truth

Schema fields are loaded from structured schema files (e.g., JSON schema, analytics logs, OpenAPI spec). Each field includes:

* `field_name`: The canonical name used to reference the field in queries and prompts.
* `description`: A plain-language explanation of what the field represents or calculates.
* `field_type`: Indicates whether the field is 'raw' (from source data) or 'derived' (computed).
* `index`: List of indexes or platforms (e.g., web, iOS) where this field is valid or relevant.
* `base_fields`: For derived fields, lists the raw fields used to compute this one.
* `defined_by`: Specifies how the field is derived, eg: COALESCE(...) AS upstreamcode
* `visibility`: Controls UI/LLM exposure — 'exposed' for user-facing, 'internal' for hidden/internal use.
* `top_values`: Common or most frequent values for the field, useful for matching or substitution.

### 🔹 Chunk Format

Each schema field is converted into a RAG chunk like:

```json
{
  "field_name": "upstreamcode",
  "description": "Returns true if pulsedata_er indicates an out-of-stock event.",
  "field_type": "derived",
  "index": ["web", "ios"],
  "base_fields": ["pulsedata_er", "pulsedata_er_ec"],
  "defined_by": "COALESCE(...) AS upstreamcode",
  "visibility": "exposed",
  "top_values": ["500.CART.1223", "500.CART.400"]
}
```

### 🔹 Chunking & Embedding

* Embedded using `title + text`
* Stored in `schema_field_rag` collection
* Optimized for semantic match with user phrases like "error rate on cart page"

### 🔹 Substitution Validation

* LLM is prompted to use matching `page_nm` based on user input
* Validator confirms the chosen value exists in schema chunks
* Fallback or suggestions used if field not matched

---

**Authors:**
Rishi Mehta — infrastructure & traceability
Sandeep Reddy — resilience & failure modes
Yogesh Bala — prompt logic & user interaction clarity



````markdown
## RAG Architecture: End-to-End System Flow

---

## 1. Overview

This document outlines the finalized architecture, flow, and subsystem responsibilities of the RAG-based analytics query assistant for OpenObserve, based on outputs from planning and requirements phase artifacts. The system separates concerns across local schema lookup, example-based retrieval, query generation, and fallback handling.

---

## 2. High-Level Flow

### User Interaction

1. User submits a natural language query (e.g., "What is the ATC error rate on search page?")
2. The system embeds the query and routes it to a Milvus-backed RAG:
   - **RAG: SQL + VRL Example Index**

> ✅ Schema metadata is resolved via structured `schemaIndex` lookups  
> ✅ RAG handles dashboard-aligned query examples

### Retrieval

3. Top `k` chunks are retrieved from RAG with cosine similarity scoring.
4. Each chunk includes metadata (e.g., `page_nm`, `field`, `metric`, `has_vrl`)
5. A post-RAG **composite scoring layer** refines relevance:

```ts
rag_score = cosine_similarity + (index_match ? 0.1 : 0) - token_overlap_penalty;
````

6. **Example Query RAG**

   * Top **3** example queries are always injected into the prompt.

7. **Schema Resolution**

   * Fields used in retrieved examples or inferred from user prompt are resolved from `schemaIndex`.
   * If multiple candidate fields match, field tags and top values guide selection.

### Prompt Construction

### Top Query Injection

* For the selected `index`, the system checks for an available top-queries file.
* This file contains up to 10 manually curated or auto-summarized unique queries frequently run against that stream.
* These queries are injected into the prompt as grounding context, regardless of user query match.
* They are meant to inform the LLM about the kind of questions typically asked on this stream.

Injected format:

> Other common queries on this stream:
>
> * What is the error rate on cart page?
> * How many ATC failures happened yesterday?
> * Show 5xx trends for the PDP page

* These examples are **not retrieved dynamically** or reranked — they are always passed through as-is.

### LLM Response

9. LLM generates a grounded **SQL + VRL query** aligned to user intent. Both are always generated.
10. Output is checked for:

    * Correct field substitution
    * Valid syntax
    * Schema alignment

### Output Handling

11. Response is:

    * Shown to user with inline metadata tags and confidence note
    * Logged for telemetry, fallback tracking, and example refinement

---

## 3. System Components

### 🔹 Milvus Collections (RAG Layer)

* `example_query_rag` (only)

Each uses:

* Custom chunking strategy
* Field-specific metadata tagging
* Cosine similarity
* Independent scoring thresholds
* Composite score reranker (as above)

### 🔹 Schema Index

* Schema metadata (field name, description, tags, types, usage) is stored in a structured, queryable `schemaIndex` object.
* Queried synchronously to:

  * Validate fields used in prompts or retrieved examples
  * Fetch types, top values, dashboard usage
  * Assist in disambiguation and field substitution

### 🔹 RAG Orchestrator

* Embeds query once
* Queries `example_query_rag`
* Resolves field metadata from `schemaIndex`
* Applies composite scoring
* Builds final prompt with top 3 examples + schema metadata + top queries

### 🔹 Prompt Generator

* Strict prompt scaffolding using template blocks
* Separates schema vs. example contexts
* Injects safety instructions ("do not copy if page mismatch")
* Tracks `prompt_id`, `included_chunks`, and `token_budget`
* **Always generates both SQL and VRL**

### 🔹 UI Layer (Yogi)

* States: success, fallback, partial match, no match
* Confidence score pill + explanation
* Previewable natural-language summary and raw SQL

---

## 4. Edge-Case Handling

* **No match from RAG** → use fallback template + expose top query hints
* **Too many matches from RAG** → rank by overlap + cap tokens
* **Substitution mismatch** → tag as `low-confidence` and prompt user
* **Unrecognized fields** → fallback UI suggestion + log for analyst triage

---

## 5. Future Considerations

* 🔍 Define PromptTemplate DSL to standardize construction
* 🧪 Build test harness to simulate RAG + LLM flow for correctness validation
* 📉 Instrument LLM success/failure with feedback hooks and telemetry
* 🗂️ Handle schema evolution with versioning, conflict flags, and reloadable schemaIndex
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
| Field mismatch    | schemaIndex lookup    | Flag metadata for correction           |
| Incorrect SQL     | Example RAG           | Mark sample for retraining or deletion |
| Prompt failure    | Prompt template logic | Adjust fallback scaffolding            |
| Repeated fallback | Retrieval engine      | Lower threshold or re-chunk examples   |

### 🔹 Processing & Routing

1. Feedback written to `feedback_events` table or queue

2. Events are periodically aggregated into:

   * **Misfire logs** (e.g. top recurring failure fields)
   * **Schema patch list**
   * **Retrieval rule refinements**

3. Analyst or auto-cron reviews apply updates:

   * Patch field metadata
   * Re-tag examples
   * Tune example chunk scoring logic

### 🔹 Impact on System Behavior

* Improves future retrieval relevance
* Reduces hallucination recurrence
* Enables "learning from user signals" loop without retraining the LLM

---

## 7. Schema Field Definition

### 🔹 Source of Truth

Schema fields are loaded from structured schema files (e.g., OpenObserve API schema, analytics logs, OpenAPI spec). Each field includes:

* `field_name`
* `description`
* `field_type`
* `index`
* `base_fields`
* `defined_by`
* `visibility`
* `top_values`
* `tags`
* `field_frequency_score`

### 🔹 Access Format

All fields are stored in a local lookup structure:

```ts
schemaIndex["upstreamcode"] = {
  field_name: "upstreamcode",
  description: "Returns true if pulsedata_er indicates an out-of-stock event.",
  field_type: "derived",
  index: "walmart_web_analytics",
  base_fields: ["pulsedata_er", "pulsedata_er_ec"],
  defined_by: "COALESCE(...) AS upstreamcode",
  tags: ["performance", "analytics"],
  visibility: "exposed",
  top_values: ["500.CART.1223", "500.CART.400"],
  field_frequency_score: 0.87
}
```

---

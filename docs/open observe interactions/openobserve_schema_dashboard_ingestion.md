````markdown
**OpenObserve Schema & Dashboard Ingestion – Refined Requirements**

---

## 1. Overview

This document defines the requirements for extracting, enriching, and reviewing both **stream-level schemas** and **dashboard panel definitions** from multiple OpenObserve environments to support schema-aware query construction and dashboard alignment.

The onboarding team owns this process end-to-end, from retrieval through LLM enhancement and manual PR review.

---

## 2. Scope of Systems

### 🔹 OpenObserve Environments

We operate across multiple deployments:

- `https://anivia.logs.prod.walmart.com/web/?org_identifier=default`
- `https://prepurchase-fe.logs.prod.walmart.com/web/?org_identifier=default`

Each deployment exposes a different set of **streams**, which map to logical **indices** in our system.

---

## 3. Schema Retrieval Pipeline

### 🔸 3.1. Index-to-URL Mapping

- A static mapping is maintained from index name to OpenObserve base URL
- User specifies index (e.g., `walmart_app_analytics`), backend resolves target URL

### 🔸 3.2. Schema API

- Endpoint: `GET /api/{org}/streams/{stream}/schema?type=logs`
- Authenticated via browser session or API token
- Returns schema with field names and types

**Sample CURL:**

```bash
curl 'https://anivia.logs.prod.walmart.com/api/default/streams/walmart_app_analytics/schema?type=logs' \
  -H 'accept: application/json' \
  -H 'Authorization: Basic <base64-encoded-user:pass>'
````

### 🔸 3.3. Field Enrichment

* For each field in the schema:

  * Run a **top N values query** to retrieve common examples via `_values` API
  * Pass field name + type + values to LLM for description generation
  * Metadata generated: `field_name`, `description`, `field_type`, `top_values[]`, `defined_by`, `index`, `visibility`, `base_fields`, `field_frequency_score`

**Sample CURL for Top Values:**

```bash
curl 'https://anivia.logs.prod.walmart.com/api/default/streams/walmart_app_analytics/_values?fields=page_nm&size=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Basic <base64-encoded-user:pass>'
```

### 🔸 3.4. Manual Review and Approval

* Generated descriptions are committed into a PR (e.g., markdown or JSON format)
* Onboarding team reviews and edits output
* Approved fields are merged into the `schemaIndex` for use in query builders or expression generators

---

## 4. Dashboard Ingestion Pipeline

### 🔸 4.1. Dashboard API Access

* Endpoint: `GET /api/{org}/dashboards?page_num=...&folder=...`
* Pagination used to crawl dashboards from each environment

**Sample CURL:**

```bash
curl 'https://anivia.logs.prod.walmart.com/api/default/dashboards?page_num=0&page_size=1000&sort_by=name&desc=false&folder=<folder_id>' \
  -H 'accept: application/json' \
  -H 'Authorization: Basic <base64-encoded-user:pass>'
```

### 🔸 4.2. Panel Extraction

* For each dashboard, extract the following per panel:

  * `title`
  * `stream` (index)
  * `query`
  * `vrlFunctionQuery`

### 🔸 4.3. LLM Enhancement

* Feed all four panel fields to LLM to:

  * Improve clarity of the panel `title`
  * Ensure titles match common NL phrasing used by users

### 🔸 4.4. Panel Review Loop

* LLM-enhanced titles are proposed via a PR
* Onboarding team reviews, edits, and approves
* Once approved, panel metadata is stored in the `example_query_rag` index for RAG

---

## 5. Auth & Access Control

* Most OpenObserve APIs require session cookies or an `Authorization` header (Basic Auth or bearer token)
* All API interactions are secured via HTTPS
* A service account is used for onboarding automation (with access to all indexes and dashboards)

---

## 6. Output Contracts

### 🔸 Schema Metadata Object Format

* `field_name`: The canonical name used to reference the field in queries and prompts.
* `description`: A plain-language explanation of what the field represents or calculates.
* `field_type`: Indicates whether the field is 'raw' (from source data) or 'derived' (computed).
* `index`: index in which the field is present
* `base_fields`: For derived fields, lists the raw fields used to compute this one.
* `defined_by`: Specifies how the field is derived, eg: COALESCE(...) AS upstreamcode
* `visibility`: Controls UI/LLM exposure — 'exposed' for user-facing, 'internal' for hidden/internal use.
* `top_values`: Common or most frequent values for the field, useful for matching or substitution.
* `tags` → to describe the functional role (error\_signal, analytics, etc.).
* `field_frequency_score` → to describe the frequency of the field being used in queries.

```json
{
  "field_name": "upstreamcode",
  "description": "Represents the upstream error classification. Derived from pulsedata_er and pulsedata_pr.",
  "field_type": "derived",
  "index": "walmart_web_analytics",
  "base_fields": ["pulsedata_er", "pulsedata_pr"],
  "defined_by": "VRL",
  "visibility": "exposed",
  "top_values": ["500.CART.1223", "500.CART.400"],
  "tags": ["performance", "analytics"],
  "field_frequency_score": 0.87
}
```

### 🔸 Dashboard Query Chunk Example

```json
{
  "title": "ATC OOS Error Rate on Cart Page",
  "stream": "walmart_web_analytics",
  "query": "SELECT ...",
  "vrlFunctionQuery": ".errorrate = ..."
}
```

---

## 7. Review Workflow

| Phase               | Reviewer          | Output                                                                       |
| ------------------- | ----------------- | ---------------------------------------------------------------------------- |
| LLM description gen | LLM + automation  | Drafted schema field metadata or panel titles                                |
| PR creation         | Onboarding script | JSON or Markdown PR                                                          |
| Review + Edit       | Onboarding team   | Cleaned-up descriptions/titles                                               |
| Merge               | Maintainer or bot | Store to schemaIndex (fields) or example\_query\_rag (for dashboard prompts) |

---

## 8. Dependencies & Risks

* Requires consistent cookie/session/token for authenticated OpenObserve APIs
* Schema drift across environments (same index may differ)
* LLM hallucination or vague titles if insufficient data is passed
* Manual review is critical to avoid injecting bad metadata into prompt-time decisions

---


````markdown
**Index & Environment Selection – UX + Routing Rules**

---

## 1. Overview

This document captures how users specify the `index` and `openobserve_index` (environment) to guide accurate query generation and backend RAG routing.

The goal is to ensure:
- Minimal ambiguity during query interpretation
- Precision when similar queries exist across streams or environments
- A natural balance between flexibility and accuracy

---

## 2. Inputs from User

### 🔹 `openobserve_index`
- Represents the environment or URL base (e.g., `anivia`, `prepurchase-fe`)
- Shown as a searchable dropdown
- Optional unless multiple deployments have overlapping indexes

### 🔹 `index` (stream)
- Represents the OpenObserve stream name (e.g., `walmart_web_analytics`, `walmart_app_analytics`)
- Shown as a searchable dropdown, filtered by `openobserve_index` selection
- Must be selected or inferred to ensure schema and dashboard lookups

---

## 3. Interaction Rules

### 🧠 Smart Resolution Logic

| User Input Scenario              | System Behavior                                      |
| -------------------------------- | ---------------------------------------------------- |
| Selects `index` only             | Auto-select matching `openobserve_index` via mapping |
| Selects `openobserve_index` only | Filter `index` dropdown by deployment                |
| Selects both                     | Use both for RAG filtering and API routing           |
| Selects neither                  | Warn user that results may be ambiguous or degraded  |

### 🧭 Prompt Guidance to User

After stream selection:

> *"To improve query accuracy, mention the index (**`walmart_app_analytics`**) in your question, e.g.:*\
> **‘What’s the error rate for cart page in walmart\_app\_analytics?’***”*

---

## 4. Session-Based UI Extensions

### 🧩 History Sidebar
- User can see previous queries with timestamps
- Click to restore query context (including index, prompt, and results)

### ⭐ Favorite Queries
- User can save a favorite with:
  - `natural_language_prompt`
  - `sql_query`
  - `vrl_function`
  - `index` (stream)
  - `openobserve_index`
- User can edit or delete favorites

### 🔁 Frequently Asked Queries
- System-generated from user history (top-N by recurrence)
- Shown in a top slider with 3 visible at once
- Pre-populates the same prompt/SQL/VRL when clicked

### 🕓 Time Range Picker (per favorite or frequent run)
- Two modes:
  - Relative (last 15m, 1h, 7d, etc.)
  - Absolute (calendar with start/end time)
- Sets execution range for SQL query

---

## 5. UX Recommendations

### ✅ Index Selector UI
- Autocomplete + search for `index`
- Option to “explore by index name”

### ✅ Environment (Deployment) Selector
- Pre-filled with most recently used `openobserve_index`
- Shown as friendly labels (e.g., “Anivia (prod)”) with full URL tooltip

### ❗ Validation & Alerts
- If no `index` selected → show: *“Please select a stream (index) for more accurate query results.”*
- If neither field selected → fallback to global/default RAG but warn user

---

## 6. Backend Routing Logic

- `index` is primary lookup key
- `openobserve_index` is derived or explicitly provided
- schema is retrived from local files based on the index.
- RAG retrieval filters only example queries by:

```json
{
  "index": "walmart_app_analytics",
  "deployment": "anivia"
}
````

---

## 7. Future Extensions

* Add ranking hints to most frequently used indexes per user/org
* Allow tagging or starring favorite indexes
* Show recent RAG hits per index

---

```
```

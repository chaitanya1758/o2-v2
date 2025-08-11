````markdown
# Event & Telemetry Logging – OpenObserve Assistant  
`/execution/event_telemetry_logging.md`

---

## 1. Overview

This file defines what events and telemetry are logged during query execution, feedback collection, and schema/panel onboarding workflows.

---

## 2. Per-Query Logging

Every time a query is executed by the assistant, the following payload is logged to the `executed_queries` table:

```json
{
  "user_id": "u_abc123",
  "query_id": "q_xyz789",
  "query_text": "what is the 5xx error rate",
  "index": "walmart_web_analytics",
  "deployment": "anivia",
  "llm_response": "SELECT count(*) ...",
  "query_result_status": "success",
  "summary_used": true,
  "openobserve_link": "https://anivia.logs/.../search?query=..."
}
````

> Logged before results are shown in the UI.

---

## 3. Feedback Events

### 👍 Positive Feedback

Table: `positive_feedback_events`

```json
{
  "user_id": "u_abc123",
  "query_id": "q_xyz789",
  "timestamp": "2025-08-03T19:22:00Z"
}
```

---

### 👎 Negative Feedback

Table: `negative_feedback_events`

Logged when a user gives a thumbs-down **and submits a correction** or comment.

```json
{
  "user_id": "u_abc123",
  "query_id": "q_xyz789",
  "feedback": "thumbs_down",
  "comment": "Field 'status_code' seems wrong",
  "corrected_query": "SELECT count(*) FROM events WHERE response_code >= 400",
  "timestamp": "2025-08-03T19:25:10Z"
}
```

---

## 4. Schema / Panel Audit Timestamps

Each new schema field or dashboard panel created through onboarding should include a `created_at` timestamp.

> No update/delete logging is enforced in MVP.

```json
{
  "field_name": "status_code",
  "created_at": "2025-08-02T11:00:00Z"
}
```

---

## 5. Future Logging (Post-MVP)

* Diff-based changelogs for schema edits
* Feedback classification (e.g., field error, panel mismatch)
* Per-panel usage telemetry
* Multi-query session logs

---

```
```

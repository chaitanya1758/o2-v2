# OpenObserve Assistant – Comprehensive Requirements Master Summary

Last updated: 2025-08-12
Source of truth: docs in this repo; file paths referenced inline.

---

## 0) Purpose of this document
A single, exhaustive reference capturing functional, non-functional, governance, UX, retrieval, execution, and integration requirements necessary to start implementation with complete context. This consolidates and normalizes content across:
- docs/project_instructions.md
- docs/commands_reference.md
- docs/UI/ui_interaction_routing_logic.md
- docs/UI/post_query_ui_interactions.md
- docs/execution/query_execution_engine.md
- docs/execution/access_control_model.md
- docs/execution/event_telemetry_logging.md
- docs/RAG/rag_architecture_flow.md
- docs/RAG/rag_retrieval_config.md
- docs/open observe interactions/openobserve_schema_dashboard_ingestion.md
- docs/personas/*
- .github/instructions/projectInstruction.instructions.md

Use this as the onboarding and implementation kickoff guide.

---

## 1) Project scope and goals
- Build an AI assistant that turns natural language into OpenObserve SQL/VRL, executes safely, and summarizes results.
- Minimize ambiguity via explicit index (stream) and environment (deployment) selection.
- Ground generation using curated dashboard panels and top queries via RAG; schema comes from local schemaIndex, not RAG.
- Provide transparent UI with previews, direct “Run in OpenObserve,” and feedback loops.

Out-of-scope and exclusions (hard constraints):
- Do not introduce or reference LangChain, LangGraph, AutoGPT, DuckDB, or similar external frameworks (.github/instructions/projectInstruction.instructions.md).

---

## 2) Personas, governance, and collaboration
See: docs/project_instructions.md; docs/personas/*; .github/instructions/projectInstruction.instructions.md

- Chaitanya: founder/PO and final decision-maker.
- Rishi: peer architect (infrastructure, API design, orchestration, traceability). 9-step refinement workflow and quality gates (≥80% coverage, CI on PRs, static analysis) in rishi_mehta_persona.md.
- Sandeep: peer architect (resilience, scalability, fault-tolerance), debate/rigor, failure modes.
- Yogesh (Yogi): PM/UX advisor (MVP boundaries, flows, clarity, feedback loops).

Communication and routing:
- One architect speaks at a time unless /debate triggered. Route to last active persona if not specified.
- Ask 1–2 critical questions at a time; challenge ideas, not people.
- Unreviewed output tagged @review-needed; document unresolved assumptions in assumption_register.md (referenced).

Governance and approvals (docs/execution/access_control_model.md):
- Only Maintainers/Onboarding Reviewers can approve/deprecate schema/panels.
- Contributors propose via PR; manual review required before prompt-time use.
- Multi-tenant visibility and auth scoping in production.

---

## 3) Environments, indices, and routing
See: docs/UI/ui_interaction_routing_logic.md

- openobserve_index: deployment/environment key (e.g., anivia, prepurchase-fe).
- index (stream): e.g., walmart_web_analytics, walmart_app_analytics.
- Smart resolution:
  - If only index selected → auto-resolve environment via mapping.
  - If only environment selected → filter index dropdown accordingly.
  - Neither selected → warn and degrade accuracy.
- Backend routing filter example:
  { "index": "walmart_app_analytics", "deployment": "anivia" }
- UI validation: require index for accurate schema/RAG. Environment defaults to last-used.

---

## 4) UI behavior after generation
See: docs/UI/post_query_ui_interactions.md

- Backend returns: index, openobserve_index, sql_query, vrlFunctionQuery (optional), time_range, confidence_score, used_derived_fields.
- Query preview: syntax-highlighted SQL/VRL; badges for confidence, fallback used, derived fields, trust.
- Run in OpenObserve: constructs link to deployment with pre-filled stream, query, and time filters; assumes user session.
- Summarize Result: executes via API, caps rows (e.g., 100), passes to LLM for natural-language summary; shows fallback banners on failure.
- Feedback and copy: copy SQL; thumbs up/down with optional correction payload; tags schema_hint_required on ambiguity.
- Edge cases: no session, API failure, ambiguous index, LLM fallback.

---

## 5) Query Execution Engine
See: docs/execution/query_execution_engine.md

- MVP: backend issues curl to OpenObserve; token/cookie passed; raw JSON parsed.
- Production: direct POST to /api/{org}/search/sql (SQL) or /api/{org}/search/logs (VRL).
- Input contract includes query_type (sql|vrl), query_text, index, deployment, time_range, auth_token.
- Timeouts and limits: 15s timeout; 50 max rows; default 15m range if unspecified.
- Error handling:
  - 5xx → retry once.
  - Timeout → show “request timed out.”
  - 4xx → “invalid request.”
  - Empty → “No data found.”
  - Malformed → bubble syntax error to UI.
- Security: HTTPS only; mask Authorization in logs; read-only token scope.
- Output format includes status, rows, fields, execution_time_ms, query_id; similar structure on errors.
- UI integration: LLM produces NL summary + raw rows; errors show toast + embedded error card; telemetry logs metadata.

---

## 6) Access control and multi-tenant model
See: docs/execution/access_control_model.md

- MVP visibility: users see streams/dashboards from selected deployment; dashboards with visibility: public are cross-deployment; minimal auth.
- Production visibility: scope by org and deployment; public means inside same deployment; strict isolation.
- Execution auth:
  - MVP: manual cookies/tokens used in dev scripts.
  - Production: SSO, secure cookie, server validates and signs outbound queries.
- Governance actions (approve/deprecate/expose) restricted to Maintainer/Onboarding Reviewer; all via PRs.

---

## 7) Event and telemetry logging
See: docs/execution/event_telemetry_logging.md

- Per-query logging to executed_queries with user_id, query_id, prompt, index, deployment, LLM response, result status, summary_used, deep link.
- Feedback events:
  - positive_feedback_events: user_id, query_id, timestamp.
  - negative_feedback_events: includes comment and corrected query details.
- Schema/panel onboarding timestamps: created_at on new fields/panels.
- Future (post-MVP): diffs for schema edits, feedback classification, per-panel telemetry, multi-query session logs.

---

## 8) Schema and dashboard ingestion
See: docs/open observe interactions/openobserve_schema_dashboard_ingestion.md

- Environments: anivia, prepurchase-fe (examples) with org=default.
- Schema retrieval:
  - GET /api/{org}/streams/{stream}/schema?type=logs (auth required).
  - Enrich each field via _values top-N; LLM generates description; metadata includes field_name, description, field_type (raw/derived), index, base_fields, defined_by, visibility, top_values, tags, field_frequency_score.
  - Manual review → PR → merge into local schemaIndex (source of truth for prompts and validation).
- Dashboard ingestion:
  - GET /api/{org}/dashboards (paged); extract per-panel: title, stream, query, vrlFunctionQuery.
  - LLM-enhance titles to match user NL phrasing.
  - Manual review → PR → store in example_query_rag collection.
- Auth: session cookie or Authorization (basic/bearer) over HTTPS; service account for automation.
- Risks: cookie/token consistency, schema drift across environments, LLM ambiguity; manual review is mandatory to prevent bad metadata injection.

---

## 9) RAG architecture and orchestration
See: docs/RAG/rag_architecture_flow.md

- Separation of concerns:
  - Schema resolution strictly from local schemaIndex; NOT a RAG target.
  - RAG targets curated example queries/panels only.
- Flow:
  1) Embed user query once; retrieve top-k from example_query_rag with cosine similarity.
  2) Composite scoring: cosine + bonuses for index/environment matches − token overlap penalty.
  3) Resolve schema fields via schemaIndex; perform disambiguation by tags/top values.
  4) Prompt construction:
     - Inject top 3 retrieved examples.
     - Inject environment+stream top queries (static list; always included).
     - Include schema metadata for referenced fields.
     - Safety instructions (don’t copy across page mismatch).
     - Always generate both SQL and VRL.
  5) Output validation and confidence tagging; UI render + telemetry logging.
- Edge cases: no match (template fallback + top query hints), too many matches (rerank+cap), substitution mismatch (low-confidence tag), unrecognized fields (fallback UI + log for triage).
- Feedback loop: thumbs, user corrections, analyst review feed into schema patches, example re-tagging, scoring adjustments.

---

## 10) Retrieval configuration and thresholds
See: docs/RAG/rag_retrieval_config.md

- Content: dashboard panel metadata chunks with panel_id, panel_title, query, vrlFunctionQuery, stream, environment, enhanced_content, quality_score, approval_status.
- Scoring formula:
  rag_score = cosine_similarity + (environment_match ? 0.1 : 0) + (stream_match ? 0.1 : 0) + (enhanced_content ? 0.05 : 0) − token_overlap_penalty − (cross_environment_penalty ? 0.05 : 0)
- Thresholds:
  - Min accept: 0.82
  - Quality threshold (panels): 0.7
  - Cross-environment min: 0.85
  - Retry once with rephrased query; do not lower thresholds.
  - Degraded mode at 0.5 (emergency only).
- Filtering:
  - Primary: environment + stream + approval_status=approved + quality>=0.7.
  - Cross-env fallback: stream + approved + quality>=0.75 + cross_env_penalty if primary <1 result.
- Environment-aware top query injection:
  - Files under /retrieval/environment_queries/{environment}_{stream}.top_queries.json
  - Always injected (token budget: 5–10) before RAG examples.
- Fallback chain levels from strict to generic examples.
- Performance and caching (prod): target retrieval p95 <200ms; cache TTLs (top queries 3600s, panels 1800s, embedding 7200s), cache_hit_bonus 0.02.
- Milvus config example: collection per environment, nprobe 16, IP metric, pool 10, timeout 5s, max_results 50.
- Monitoring: retrieval_latency_p95, cache_hit_rate, fallback_activation_rate, cross_environment_retrieval_rate, quality_threshold_violations; health checks for Milvus, embeddings, file freshness.
- Development/MVP: single env filter, basic cosine, file-based top queries, no caching.

---

## 11) Confirmed architectural choices (consolidated)
- Schema is not part of RAG; resolved from local schemaIndex.
- All dashboards/examples are vectorized for RAG.
- Inject up to 10 top queries per environment+stream (static files); always present in prompt.
- Min RAG score 0.82; retry once; do not loosen on retry.
- Prompt always includes intent + 3 examples + top queries; generate SQL and VRL.
- UI shows NL summary + raw results; confidence and fallback badges.
- Feedback loop logs thumbs up/down with context; negative feedback includes correction payloads.
- Maintainers approve/deprecate schema/panels.

---

## 12) Non-functional requirements
- Performance: retrieval p95 <200ms (prod target); execution timeout 15s; result capping 50 rows (engine) and up to 100 rows for summarization sampling.
- Availability: 99.9% retrieval uptime target (prod).
- Security: HTTPS only; mask Authorization in logs; read-only scopes; SSO and secure cookies in production.
- Operability: telemetry for executed_queries and feedback; health checks for dependencies.

---

## 13) Developer workflow and quality gates
See: docs/personas/rishi_mehta_persona.md

- 9-step refinement workflow (WBS → subtasks → tradeoffs → parallelization → test-first → VCS discipline → quality gates → DoD → feedback loop).
- Quality gates: ≥80% test coverage, CI build/test on every PR, static analysis and security scans.
- Branching and PR reviews mandatory; maintainers as approvers for governance artifacts.

---

## 14) Implementation starting points
Repository structure highlights:
- o2-rag-main/app/backend: reference RAG and backend scaffolding (embedding.py, rag.py, vectordb.py, llm.py, app.py).
- o2-rag-main/app/frontend: chat app, response generator.
- docs/*: specs that must be reflected in implementation.

Initial backlog (suggested):
1) Bootstrap local schemaIndex loader with validation against schema metadata contract; add unit tests.
2) Implement environment+stream top-queries provider (file-based) with TTL cache and freshness checks.
3) Implement RAG retrieval wrapper for example_query_rag with composite scoring, filters, and fallback chain.
4) Implement prompt builder templating with deterministic sections (schema block, top queries, retrieved examples, safety instructions).
5) Implement Query Execution Engine adapter for OpenObserve SQL and VRL endpoints with 15s timeout and retry-on-5xx.
6) Wire UI: index/environment selectors, preview pane, Run in OpenObserve, Summarize Result, feedback capture.
7) Telemetry ingestion endpoints for executed_queries and feedback events; persist deep links and prompt metadata.
8) Governance pipeline: PR template and reviewer rules for schema/panel onboarding outputs.

---

## 15) Open questions and assumptions
Open questions (need confirmation):
- Exact org identifiers for each deployment (default assumed in examples).
- Canonical list of supported streams per environment and their labels for UI.
- Final row caps for summarization in production (100 proposed).
- Embedding model choice and dimension for Milvus (reference implementation may define).

Expanded clarification checklist:
- Immediate confirmations
  - Exact org IDs per environment (e.g., anivia=default, prepurchase-fe=default)?
  - Canonical stream catalog per environment (names, friendly labels, deprecated aliases)?
- Environment, routing, and URLs
  - Base URLs per environment (prod/stage/dev) and mapping file env→URL/org?
  - Any private environments hidden from UI? Default environment for first-time users?
- Streams and schema
  - Stream aliases to normalize (case/hyphens/legacy)? Known schema drift for same stream across envs?
  - Fields excluded from exposure (PII/internal)? Derived field definitions (VRL/SQL) and owners?
  - Schema refresh cadence and change notification/source of truth?
- Top queries (grounding)
  - Source of truth (usage logs vs manual curation) and generation cadence (weekly/daily)?
  - Max count per file (5 vs 10) and token budget rules; path naming under /retrieval/environment_queries/ confirmed?
  - Governance: who approves updates, and review SLA?
- RAG retrieval and embedding
  - Embedding model/provider/dimension; rate limits and cost guardrails?
  - Milvus version, index type (HNSW/IVF), metric (IP/cosine), search params (nprobe/ef)?
  - One collection per environment vs multi-tenant; max retrieved chunks and rerank settings?
  - Threshold overrides allowed per environment/stream?
- Prompting and output
  - Mandatory preamble or legal text? SQL dialect nuances for OpenObserve to enforce?
  - VRL output required always, or SQL-only for MVP? Confidence badge thresholds (Low/Med/High)?
- Execution engine and limits
  - Row cap for execution (50) and summarization sampling (100) final? Global request timeout?
  - Retry/backoff beyond single retry on 5xx? Max concurrency per user/global?
- Auth and security
  - SSO provider and token format (OIDC/JWT)? Cookie name/domain/SameSite/Secure flags?
  - Backend→OpenObserve auth: service account vs user token? Secrets store and rotation policy?
  - CORS allowed origins list?
- Access control and visibility
  - Public dashboard semantics confirmed (MVP cross-deployment; prod scoped)?
  - Per-org multi-tenancy model: single-org users vs multi-org? Field-level restrictions post-MVP?
- Telemetry and privacy
  - Storage backend for executed_queries and feedback (DB type, schema)?
  - PII policy: redact query_text/comments fields? Retention policy and deletion SLAs? Sampling rules?
  - Required SLIs/SLOs dashboards (p95 retrieval latency, fallback rate, etc.)?
- UX and product
  - Default time range (last 15m) and allowed presets? Behavior when env/stream not selected (block vs degraded)?
  - Deep link format for “Run in OpenObserve” (relative vs absolute time)? Accessibility/i18n needs?
  - Feature flags needed (summarization, VRL preview, feedback form)?
- Governance and workflows
  - PR templates/labels for schema/panel changes, required reviewers, auto-assign rules?
  - CI checks for governance PRs (lint/validation)? Versioning and rollback for schemaIndex?
- Performance, reliability, and ops
  - Confirm SLAs (retrieval p95 <200ms; availability 99.9%). Upstream rate limits (OpenObserve, embeddings)?
  - Circuit breakers and degraded mode trigger (0.5 threshold) details? Alerting channels/on-call policy?
- Testing and QA
  - Golden NL→SQL/VRL test cases per stream? Synthetic datasets/fixtures for CI? E2E environments?
  - Load testing targets (QPS/concurrency) and acceptance thresholds?
- Deployment and release
  - Target platform (Kubernetes/VM), regions, config management (env files/secrets), deployment strategy (rolling/blue-green)?
  - Observability stack (logs/metrics/traces) and dashboards to ship Day 1?
- Docs and onboarding
  - Create/maintain assumption_register.md? Dev runbooks and user help pages scope?
  - Ownership of this requirements summary and update cadence?

Assumptions (until updated in assumption_register.md):
- Service account has read access to schemas and dashboards across deployments for onboarding.
- Users will have valid OpenObserve sessions when clicking “Run in OpenObserve.”
- schemaIndex is versioned and reloadable without service restart.
- Top queries are curated weekly from executed_queries logs.

---

## 16) Glossary
- openobserve_index: deployment/environment key used to route API requests.
- index/stream: OpenObserve stream name used for schema and queries.
- schemaIndex: local, structured store of field metadata used for prompt validation and substitution.
- example_query_rag: Milvus collection of curated dashboard panels/examples for retrieval.
- Top queries: environment+stream curated NL queries injected into prompt as grounding hints.

---

## 17) Appendix – API endpoint catalog (examples)
- Schema: GET /api/{org}/streams/{stream}/schema?type=logs
- Top values: GET /api/{org}/streams/{stream}/_values?fields={field}&size={N}
- Dashboards: GET /api/{org}/dashboards?page_num={n}&page_size={m}&sort_by=name&desc=false&folder={folder}
- Execute SQL: POST /api/{org}/search/sql
- Execute VRL: POST /api/{org}/search/logs

---

## 18) Change log
- 2025-08-12: Initial comprehensive consolidation created from all referenced docs.

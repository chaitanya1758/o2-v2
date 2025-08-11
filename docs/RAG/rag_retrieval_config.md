```markdown
# RAG Retrieval Config – OpenObserve Assistant  
`/RAG/rag_retrieval_config.md`

---

## 1. Overview

This file defines the retrieval configuration and scoring rules used by the Milvus-based RAG system to power dashboard panel retrieval and prompt grounding for the OpenObserve Assistant.

The system retrieves enhanced dashboard panel metadata across multiple environments (Anivia, Prepurchase) to provide contextual examples for natural language query generation.

---

## 2. Dashboard Panel Retrieval Context

### Content Type
The RAG system specifically retrieves **dashboard panel metadata** with the following structure:

```json
{
  "panel_id": "uuid",
  "panel_title": "Error Rate - Cart Page",
  "query": "SELECT COUNT(*) FROM logs WHERE status >= 400",
  "vrlFunctionQuery": "filter .status >= 400 | count",
  "stream": "walmart_web_analytics", 
  "environment": "anivia",
  "enhanced_content": true,
  "quality_score": 0.85,
  "approval_status": "approved"
}
```

### Embedding Strategy
- Panel titles and queries are embedded together for semantic similarity
- Enhanced panels receive quality boost in scoring
- Environment and stream metadata used for filtering and bonuses

---

## 3. Enhanced Chunk Scoring Formula

```ts
rag_score = cosine_similarity
          + (environment_match ? 0.1 : 0)
          + (stream_match ? 0.1 : 0) 
          + (enhanced_content ? 0.05 : 0)
          - token_overlap_penalty
          - (cross_environment_penalty ? 0.05 : 0)
```

### Components:

* `cosine_similarity`: Primary vector match score from embedding model (0.0-1.0)
* `environment_match`: +0.1 bonus if panel from same environment as user context
* `stream_match`: +0.1 bonus if panel from same stream as user-selected stream
* `enhanced_content`: +0.05 bonus for governance-enhanced panels
* `token_overlap_penalty`: Reduces score for overly verbose or redundant content
* `cross_environment_penalty`: -0.05 penalty when retrieving from different environment

---

## 4. Scoring Thresholds

| Rule                    | Value                             |
| ----------------------- | --------------------------------- |
| Min score to accept     | 0.82                              |
| Quality threshold       | 0.7 (panels only)                |
| Cross-env min score     | 0.85 (higher bar)                |
| Fallback if no match    | ✅ Retry once with rephrased query |
| Retry threshold         | Still 0.82 (do not loosen)        |
| Max retries             | 1                                 |
| Degraded mode threshold | 0.5 (emergency fallback)         |

---

## 5. Multi-Environment Filtering

### Primary Filters
All retrieval is filtered by:

```json
{
  "environment": "<user_selected_environment>",
  "stream": "<user_selected_stream>",
  "approval_status": "approved",
  "quality_score": ">= 0.7"
}
```

### Cross-Environment Fallback
If primary environment yields < 1 result:

```json
{
  "stream": "<user_selected_stream>",
  "approval_status": "approved", 
  "quality_score": ">= 0.75",
  "apply_cross_environment_penalty": true
}
```

### Optional Filters (Production Phase):
* `panel_type`: ["metric", "table", "graph"]
* `recency_weight`: Boost recently used panels
* `user_preference_score`: Personal usage history weighting

---

## 6. Environment-Aware Top Query Injection

### File Structure
```
/retrieval/environment_queries/
├── anivia_walmart_web_analytics.top_queries.json
├── anivia_walmart_app_analytics.top_queries.json  
├── prepurchase_walmart_web_analytics.top_queries.json
└── prepurchase_walmart_app_analytics.top_queries.json
```

### Example Format:

```json
{
  "environment": "anivia",
  "stream": "walmart_web_analytics",
  "top_queries": [
    "What is the error rate on cart page?",
    "How many ATC failures happened yesterday?", 
    "Show 5xx trends for the PDP page",
    "Which API endpoints have highest latency?",
    "Cart abandonment rate by browser type"
  ],
  "last_updated": "2025-01-15T10:00:00Z",
  "query_count": 5
}
```

### Injection Behavior:

* Queries injected based on `{environment}_{stream}` combination
* Fallback to stream-only if environment-specific file missing
* Token budget management: 5 queries if tight, 10 if available
* Injected **before** retrieved panel examples in prompt

**Prompt Template:**
```
Environment: {environment}
Stream: {stream}

Common queries for this environment and stream:
• What is the error rate on cart page?
• How many ATC failures happened yesterday?
• Show 5xx trends for the PDP page

Retrieved relevant panels:
[RAG retrieved content here]
```

---

## 7. Fallback and Error Handling Configuration

### Fallback Strategy
```json
{
  "fallback_chain": [
    {
      "level": 1,
      "filters": "environment + stream + quality >= 0.7",
      "min_results": 2
    },
    {
      "level": 2, 
      "filters": "stream + quality >= 0.75",
      "min_results": 1,
      "apply_cross_env_penalty": true
    },
    {
      "level": 3,
      "filters": "environment + quality >= 0.8", 
      "min_results": 1,
      "cross_stream_allowed": true
    },
    {
      "level": 4,
      "template_fallback": true,
      "use_generic_examples": true
    }
  ]
}
```

### Error Handling
- **Milvus Connection Failure**: Return cached top queries only
- **Embedding Service Failure**: Use keyword-based fallback retrieval
- **No Results Above Threshold**: Activate degraded mode (0.5 threshold)

---

## 8. Performance and Caching Configuration

### Milvus Optimization
```json
{
  "milvus_config": {
    "collection_name": "dashboard_panels_{environment}",
    "search_params": {"nprobe": 16, "metric_type": "IP"},
    "connection_pool_size": 10,
    "timeout_ms": 5000,
    "max_results": 50
  }
}
```

### Caching Strategy
```json
{
  "cache_config": {
    "top_queries_ttl": 3600,
    "panel_cache_ttl": 1800,
    "embedding_cache_ttl": 7200,
    "cache_hit_bonus": 0.02
  }
}
```

### Performance SLAs
- **Retrieval Latency**: < 200ms (95th percentile)
- **Cache Hit Rate**: > 80% for top queries
- **Availability**: 99.9% uptime requirement

---

## 9. Governance Integration Settings

### Enhanced Panel Prioritization
```json
{
  "governance_weights": {
    "enhanced_content_boost": 0.05,
    "maintainer_approved_boost": 0.03,
    "community_usage_weight": 0.02,
    "quality_score_multiplier": 1.1
  }
}
```

### Panel Quality Scoring
- **Base Quality**: Automated parsing success + query validity
- **Enhanced Quality**: Manual governance review + community feedback
- **Usage Quality**: Query execution success rate + user feedback

---

## 10. Maintenance and Monitoring

### Automated Maintenance
- **Top Queries**: Generated weekly from query execution logs
- **Panel Quality**: Re-scored daily based on usage metrics
- **Cache Invalidation**: Triggered on panel updates or governance changes
- **Embedding Refresh**: Monthly re-embedding for content drift detection

### Monitoring Metrics
```json
{
  "key_metrics": [
    "retrieval_latency_p95",
    "cache_hit_rate", 
    "fallback_activation_rate",
    "cross_environment_retrieval_rate",
    "quality_threshold_violations"
  ]
}
```

### Health Checks
- Milvus collection availability
- Embedding service responsiveness  
- Top query file freshness
- Cross-environment balance

---

## 11. Development Phase Configuration

### MVP Phase
- Single environment filtering only
- Basic cosine similarity scoring
- File-based top query injection
- No caching or performance optimization

###
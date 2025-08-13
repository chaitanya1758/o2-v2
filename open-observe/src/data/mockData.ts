// Mock data for development and testing
export const mockEnvironments = [
  {
    value: 'anivia',
    label: 'Anivia (Production)',
    indices: ['walmart_web_analytics', 'walmart_app_analytics', 'user_behavior_logs']
  },
  {
    value: 'staging',
    label: 'Staging',
    indices: ['test_logs', 'staging_analytics', 'dev_traces']
  }
];

export const mockSavedQueries = [
  {
    id: 'cart-errors',
    name: 'Cart Page Errors',
    query: 'Show me all cart page errors in the last 24 hours',
    index: 'walmart_app_analytics'
  },
  {
    id: 'conversion-rates',
    name: 'Conversion Rate Analysis',
    query: 'What are the weekly conversion rates by traffic source?',
    index: 'walmart_web_analytics'
  },
  {
    id: 'checkout-performance',
    name: 'Checkout Performance',
    query: 'Analyze checkout page performance metrics',
    index: 'walmart_web_analytics'
  }
];

export const mockFrequentQueries = [
  {
    id: 'errors-5xx',
    query: 'Show me all 5xx errors from the last hour',
    usage: 'Used 15 times this week'
  },
  {
    id: 'response-times',
    query: 'What are the average API response times for each endpoint?',
    usage: 'Used 8 times this week'
  },
  {
    id: 'user-sessions',
    query: 'Show me user session data for today',
    usage: 'Used 12 times this week'
  }
];

export const generateMockQueryResponse = (userMessage: string, selectedIndex: string) => {
  const isErrorQuery = userMessage.toLowerCase().includes('error');
  const isPerformanceQuery = userMessage.toLowerCase().includes('performance') || userMessage.toLowerCase().includes('response');
  const hasTransform = userMessage.toLowerCase().includes('transform') || isErrorQuery || isPerformanceQuery;

  let mockSQL = '';
  
  if (isErrorQuery) {
    mockSQL = `SELECT timestamp, level, message, source, user_id
FROM ${selectedIndex || 'default_stream'}
WHERE level IN ('ERROR', 'FATAL')
  AND timestamp >= now() - interval '24 hours'
ORDER BY timestamp DESC
LIMIT 100`;
  } else if (isPerformanceQuery) {
    mockSQL = `SELECT endpoint, 
       AVG(response_time) as avg_response_time,
       COUNT(*) as request_count,
       PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time
FROM ${selectedIndex || 'default_stream'}
WHERE timestamp >= now() - interval '1 hour'
GROUP BY endpoint
ORDER BY avg_response_time DESC`;
  } else {
    mockSQL = `SELECT timestamp, level, message, source
FROM ${selectedIndex || 'default_stream'}
WHERE timestamp >= now() - interval '1 hour'
ORDER BY timestamp DESC
LIMIT 50`;
  }

  // Always include VRL for better demo experience
  const mockVRL = hasTransform ? `# Transform and enrich log data
if .level == "ERROR" {
  .severity = "high"
  .alert_required = true
  .priority = 1
}

if .level == "WARN" {
  .severity = "medium"
  .alert_required = false
  .priority = 2
}

# Add response time categorization
if exists(.response_time) {
  if .response_time > 5000 {
    .slow_query = true
    .performance_category = "slow"
  } else if .response_time > 1000 {
    .performance_category = "medium"
  } else {
    .performance_category = "fast"
  }
}

# Parse user agent if available
if exists(.user_agent) {
  .parsed_ua = parse_user_agent!(.user_agent)
}` : `# Basic log processing
.processed_at = now()
.log_version = "v1.0"

# Add metadata
if !exists(.source) {
  .source = "unknown"
}`;

  return {
    sql: mockSQL,
    vrl: mockVRL,
    badges: [
      { type: 'high' as const, text: 'High Confidence' },
      ...(isErrorQuery ? [{ type: 'derived' as const, text: 'Error Analysis' }] : []),
      ...(isPerformanceQuery ? [{ type: 'medium' as const, text: 'Performance' }] : [])
    ]
  };
};

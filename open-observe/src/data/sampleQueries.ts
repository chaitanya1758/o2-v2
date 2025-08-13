// Sample query templates for testing the OpenObserve Query Assistant
export const sampleQueries = [
  {
    category: "Error Analysis",
    queries: [
      "Show me all 5xx errors from the last hour",
      "Find all cart page errors in the last 24 hours",
      "What are the most common error messages today?",
      "Show me error distribution by service in the past week"
    ]
  },
  {
    category: "Performance Monitoring",
    queries: [
      "What are the average API response times for each endpoint?",
      "Show me the slowest queries from the last hour",
      "Find all requests with response time > 5 seconds",
      "Analyze database query performance trends"
    ]
  },
  {
    category: "User Analytics",
    queries: [
      "Show me user session data for today",
      "What are the top user flows on our website?",
      "Find bounce rate by page for the last week",
      "Analyze conversion funnel performance"
    ]
  },
  {
    category: "Infrastructure",
    queries: [
      "Show me memory usage across all services",
      "Find CPU spikes in the last 6 hours",
      "What services have high network latency?",
      "Monitor disk usage trends by server"
    ]
  },
  {
    category: "Business Metrics",
    queries: [
      "Calculate daily active users for this month",
      "Show revenue trends by product category",
      "Find top-selling products by region",
      "Analyze customer retention rates"
    ]
  }
];

export const getRandomQuery = (): string => {
  const allQueries = sampleQueries.flatMap(category => category.queries);
  return allQueries[Math.floor(Math.random() * allQueries.length)];
};

export const getQueriesByCategory = (category: string): string[] => {
  const categoryData = sampleQueries.find(c => c.category === category);
  return categoryData ? categoryData.queries : [];
};

export interface QueryResult {
  sql: string;
  vrl?: string;
  badges: Badge[];
}

export interface Badge {
  type: 'high' | 'medium' | 'derived';
  text: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  index: string;
}

export interface FrequentQuery {
  id: string;
  query: string;
  usage: string;
}

export interface Message {
  id: number;
  sender: 'user' | 'assistant';
  content: string;
  queryResult?: QueryResult;
  timestamp: Date;
}

export interface Environment {
  value: string;
  label: string;
  indices: string[];
}

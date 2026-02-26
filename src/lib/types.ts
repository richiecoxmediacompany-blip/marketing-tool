export interface CompanyReport {
  companyName: string;
  website: string;
  overview: string;
  businessModel: string;
  targetMarket: string;
  productsAndServices: string[];
  competitors: Competitor[];
  recentNews: NewsItem[];
  marketPosition: {
    category: "Leader" | "Challenger" | "Niche Player" | "Emerging";
    explanation: string;
  };
}

export interface Competitor {
  name: string;
  description: string;
}

export interface NewsItem {
  headline: string;
  summary: string;
}

export interface ResearchRequest {
  query: string;
}

export interface ResearchResponse {
  success: boolean;
  report?: CompanyReport;
  error?: string;
}

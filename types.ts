
export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  color: string;
}

export interface Entry {
  id: string;
  categoryId: string;
  text: string;
  tags: string[];
  createdAt: string; // ISO string
}

export interface Report {
  id: string;
  period: string; // 'Day', 'Week', 'Month', 'Custom'
  startDate: string;
  endDate: string;
  content: string;
  generatedAt: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  REPORTS = 'REPORTS',
  CATEGORIES = 'CATEGORIES'
}

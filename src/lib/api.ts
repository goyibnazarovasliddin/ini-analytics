// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Types matching backend responses
export interface SourceMetadata {
  source_url: string;
  last_fetched_at: string | null;
  available_period_min: string | null;
  available_period_max: string | null;
  total_classifiers: number;
  total_indices: number;
}

export interface KPIData {
  code: string;
  label: string;
  cumulative_percent: number;
  last_month_mom_percent: number;
}

export interface SeriesData {
  periods: string[];
  series: {
    code: string;
    label: string;
    values: (number | null)[];
  }[];
}

export interface TableData {
  periods: string[];
  rows: {
    code: string;
    label: string;
    values: { [period: string]: number | null };
  }[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface Classifier {
  code: string;
  label: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  name_uzc: string | null;
  parent_code: string | null;
}

// API Client
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Metadata
  async getSourceMetadata(): Promise<SourceMetadata> {
    return this.request<SourceMetadata>('/meta/source');
  }

  // Classifiers
  async getClassifiers(params?: {
    q?: string;
    lang?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ classifiers: Classifier[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.append('q', params.q);
    if (params?.lang) queryParams.append('lang', params.lang);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request(`/classifiers${query ? `?${query}` : ''}`);
  }

  // Analytics - KPI
  async getKPI(params: {
    start: string;
    end: string;
    lang?: string;
  }): Promise<{ start: string; end: string; kpis: KPIData[] }> {
    const queryParams = new URLSearchParams({
      start: params.start,
      end: params.end,
      lang: params.lang || 'uz',
    });

    return this.request(`/analytics/kpi?${queryParams.toString()}`);
  }

  // Analytics - Series
  async getSeries(params: {
    codes: string[];
    start: string;
    end: string;
    metric: 'mom' | 'yoy' | 'cumulative';
    lang?: string;
  }): Promise<SeriesData> {
    const queryParams = new URLSearchParams({
      codes: params.codes.join(','),
      start: params.start,
      end: params.end,
      metric: params.metric,
      lang: params.lang || 'uz',
    });

    return this.request(`/analytics/series?${queryParams.toString()}`);
  }

  // Analytics - Table
  async getTable(params: {
    codes?: string[];
    start: string;
    end: string;
    metric: 'mom' | 'yoy' | 'cumulative';
    lang?: string;
    page?: number;
    page_size?: number;
  }): Promise<TableData> {
    const queryParams = new URLSearchParams({
      start: params.start,
      end: params.end,
      metric: params.metric,
      lang: params.lang || 'uz',
      page: (params.page || 1).toString(),
      page_size: (params.page_size || 50).toString(),
    });

    if (params.codes && params.codes.length > 0) {
      queryParams.append('codes', params.codes.join(','));
    }

    return this.request(`/analytics/table?${queryParams.toString()}`);
  }

  // Export
  getExportURL(params: {
    format: 'csv' | 'xlsx';
    codes?: string[];
    start: string;
    end: string;
    metric: 'mom' | 'yoy' | 'cumulative';
    lang?: string;
  }): string {
    const queryParams = new URLSearchParams({
      format: params.format,
      start: params.start,
      end: params.end,
      metric: params.metric,
      lang: params.lang || 'uz',
    });

    if (params.codes && params.codes.length > 0) {
      queryParams.append('codes', params.codes.join(','));
    }

    return `${this.baseURL}/export?${queryParams.toString()}`;
  }


  // Admin - Refresh Data
  async refreshData(adminKey: string): Promise<{ jobId: string; status: string }> {
    return this.request('/admin/refresh', {
      method: 'POST',
      headers: {
        'X-ADMIN-KEY': adminKey,
      },
    });
  }

  // Admin - Get Refresh Job Status
  async getRefreshJobStatus(jobId: string): Promise<{
    id: string;
    status: string;
    progress: number;
    total_rows: number;
    processed_rows: number;
    eta_seconds: number | null;
    error_message: string | null;
    started_at: string;
    completed_at: string | null;
  }> {
    return this.request(`/admin/refresh/${jobId}`);
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL);

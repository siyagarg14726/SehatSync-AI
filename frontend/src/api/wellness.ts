import apiClient from './axios';
import { WellnessCheckIn, WellnessInsight, TrendDataPoint } from '../types';

interface WellnessTrendResponse {
  daily_trends: TrendDataPoint[];
}

interface WellnessInsightResponse {
  overview: string;
  explainable_factors: string[];
  recommendations: string[];
  stress_level_status: string;
  sleep_status: string;
  generated_at: string;
}

export const wellnessApi = {
  submitCheckIn: async (data: WellnessCheckIn): Promise<WellnessCheckIn> => {
    const response = await apiClient.post<WellnessCheckIn>('/api/v1/wellness/check-in', data);
    return response.data;
  },

  getCheckIns: async (page = 1, pageSize = 30): Promise<WellnessCheckIn[]> => {
    const offset = (page - 1) * pageSize;
    const response = await apiClient.get<WellnessCheckIn[]>(
      `/api/v1/wellness/check-ins?limit=${pageSize}&offset=${offset}`,
    );
    return response.data;
  },

  getAllCheckIns: async (): Promise<WellnessCheckIn[]> => {
    const pageSize = 100;
    const history: WellnessCheckIn[] = [];
    let page = 1;
    while (true) {
      const checkIns = await wellnessApi.getCheckIns(page, pageSize);
      history.push(...checkIns);
      if (checkIns.length < pageSize) return history;
      page += 1;
    }
  },

  getLatestCheckIn: async (): Promise<WellnessCheckIn | null> => {
    const response = await apiClient.get<WellnessCheckIn | null>('/api/v1/wellness/check-ins/latest');
    return response.data;
  },

  getWellnessTrends: async (days = 30): Promise<TrendDataPoint[]> => {
    const response = await apiClient.get<WellnessTrendResponse>(
      `/api/v1/wellness/trends?days=${days}`,
    );
    return response.data.daily_trends;
  },

  getAiInsights: async (): Promise<WellnessInsight> => {
    const response = await apiClient.post<WellnessInsightResponse>(
      '/api/v1/wellness/insights?days=7',
    );
    return {
      summary: response.data.overview,
      risk_level: response.data.stress_level_status,
      insights: response.data.explainable_factors,
      recommendations: response.data.recommendations,
      generated_at: response.data.generated_at,
    };
  },
};

// Create this file at: src/types/google-trends-api.d.ts

declare module 'google-trends-api' {
    export interface TrendsOptions {
      keyword: string | string[];
      startTime?: Date;
      endTime?: Date;
      geo?: string;
      hl?: string;
      timezone?: number;
      category?: number;
      property?: string;
      granularTimeResolution?: boolean;
    }
  
    export interface RelatedQueriesOptions {
      keyword: string | string[];
      startTime?: Date;
      endTime?: Date;
      geo?: string;
      hl?: string;
      category?: number;
      property?: string;
    }
  
    export interface RelatedTopicsOptions {
      keyword: string | string[];
      startTime?: Date;
      endTime?: Date;
      geo?: string;
      hl?: string;
      category?: number;
      property?: string;
    }
  
    export interface RealTimeTrendsOptions {
      geo?: string;
      hl?: string;
      category?: string;
      property?: string;
    }
  
    export interface DailyTrendsOptions {
      geo?: string;
      hl?: string;
      trendDate?: Date;
      category?: number;
      property?: string;
    }
  
    export function interestOverTime(options: TrendsOptions): Promise<string>;
    export function interestByRegion(options: TrendsOptions): Promise<string>;
    export function relatedQueries(options: RelatedQueriesOptions): Promise<string>;
    export function relatedTopics(options: RelatedTopicsOptions): Promise<string>;
    export function dailyTrends(options: DailyTrendsOptions): Promise<string>;
    export function realTimeTrends(options: RealTimeTrendsOptions): Promise<string>;
  }
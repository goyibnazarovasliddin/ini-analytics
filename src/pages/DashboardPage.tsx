import { useState, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { FilterPanel } from '../components/FilterPanel';
import { KPICards } from '../components/KPICards';
import { ChartSection } from '../components/ChartSection';
import { DataTable } from '../components/DataTable';
import { mockCPIData, getAvailableMonths, calculateCumulative } from '../lib/mockData';
import { apiClient } from '../lib/api';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { useRefresh } from '../lib/contexts/RefreshContext';

export type IndicatorType = 'mom' | 'yoy' | 'cumulative';

export interface FilterState {
  selectedClassifiers: string[];
  dateRange: {
    start: string;
    end: string;
  };
  indicatorType: IndicatorType;
  percentageOnly: boolean;
}

export function DashboardPage() {
  const { t, language } = useLanguage();
  const { refreshTrigger, setIsDataFetching } = useRefresh();
  const availableMonths = getAvailableMonths();

  const [filters, setFilters] = useState<FilterState>({
    selectedClassifiers: ['1', '1.02', '1.03', '1.04'],
    dateRange: {
      start: availableMonths[0], // Temporary, will be updated
      end: availableMonths[availableMonths.length - 1], // Temporary, will be updated
    },
    indicatorType: 'cumulative',
    percentageOnly: true,
  });

  const [realData, setRealData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch metadata and set default date range
  useEffect(() => {
    async function fetchMetadataAndSetDates() {
      try {
        const metadata = await apiClient.getSourceMetadata();

        if (metadata.available_period_max) {
          // End date: latest period from DB (e.g., "2025-12")
          const endDate = metadata.available_period_max;

          // Start date: first month of previous year
          // If endDate is "2025-12", startDate should be "2024-01"
          const endYear = parseInt(endDate.split('-')[0]);
          const startYear = endYear - 1;
          const startDate = `${startYear}-01`;

          // Convert to "YYYY-MXX" format for UI
          const startFormatted = startDate.replace('-', '-M');
          const endFormatted = endDate.replace('-', '-M');

          setFilters(prev => ({
            ...prev,
            dateRange: {
              start: startFormatted,
              end: endFormatted
            }
          }));
        }
      } catch (error) {
        console.error('Failed to fetch metadata for default dates:', error);
      }
    }

    fetchMetadataAndSetDates();
  }, []); // Run once on mount

  useEffect(() => {
    async function fetchData() {
      console.log('📊 DashboardPage: Fetching data... (refreshTrigger:', refreshTrigger, ')');
      if (filters.selectedClassifiers.length === 0) {
        setRealData([]);
        setIsDataFetching(false);
        return;
      }

      setLoading(true);
      try {
        // Convert "2024-M01" -> "2024-01" for API
        const start = filters.dateRange.start.replace('M', '');
        const end = filters.dateRange.end.replace('M', '');

        const res = await apiClient.getSeries({
          codes: filters.selectedClassifiers,
          start,
          end,
          metric: filters.indicatorType,
          lang: language
        });

        const transformed = res.series.map(s => {
          const monthlyData: any = {};
          res.periods.forEach((p, idx) => {
            const parts = p.split('-');
            const mKey = `${parts[0]}-M${parts[1]}`;
            const val = s.values[idx];
            if (val !== null) monthlyData[mKey] = val;
          });

          return {
            code: s.code,
            nameUz: s.label,
            nameRu: s.label,
            nameEn: s.label,
            monthlyData
          };
        });
        setRealData(transformed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        // Small delay to ensure smooth transition
        setTimeout(() => setIsDataFetching(false), 500);
      }
    }
    fetchData();
  }, [filters, language, refreshTrigger]);

  return (
    <div className="space-y-6 pb-20 lg:pb-6 relative">
      {/* Subtle loading indicator for background refetching */}
      {loading && realData.length > 0 && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-medium">Yangilanmoqda...</span>
        </div>
      )}

      <FilterPanel filters={filters} setFilters={setFilters} />
      <KPICards filters={filters} />

      {loading && realData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center flex-col gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-muted-foreground font-medium">Ma'lumotlar yuklanmoqda...</span>
        </div>
      ) : (
        <>
          <ChartSection filters={filters} data={realData} />
          <DataTable filters={filters} data={realData} />
        </>
      )}
    </div>
  );
}

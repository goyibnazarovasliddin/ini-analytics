import { useEffect, useState } from 'react';
import { FilterState } from '../pages/DashboardPage';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { useRefresh } from '../lib/contexts/RefreshContext';
import { apiClient, KPIData } from '../lib/api';
import { Card } from './ui/card';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from './ui/utils';

interface KPICardsProps {
  filters: FilterState;
}

export function KPICards({ filters }: KPICardsProps) {
  const { t, language } = useLanguage();
  const { refreshTrigger } = useRefresh();
  const [data, setData] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchKPIs() {
      console.log('📈 KPICards: Fetching KPIs... (refreshTrigger:', refreshTrigger, ')');
      setLoading(true);
      try {
        const res = await apiClient.getKPI({
          start: filters.dateRange.start,
          end: filters.dateRange.end,
          lang: language
        });
        // Sort specifically to Ensure order: '1', '1.02', '1.03', '1.04'
        const order = ['1', '1.02', '1.03', '1.04'];
        const sorted = res.kpis.sort((a, b) => {
          return order.indexOf(a.code) - order.indexOf(b.code);
        });
        setData(sorted);
      } catch (e) {
        console.error("Failed to fetch KPIs", e);
      } finally {
        setLoading(false);
      }
    }
    fetchKPIs();
  }, [filters.dateRange, language, refreshTrigger]);

  if (loading && data.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="h-32 rounded-[18px] bg-card/50 border-border/50 animate-pulse flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((kpi) => {
        const isPositive = kpi.cumulative_percent >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const iconColorClass = isPositive ? 'text-emerald-500' : 'text-red-500';
        const iconBgClass = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';
        const percentColorClass = isPositive ? 'text-emerald-500' : 'text-red-500';

        return (
          <Card
            key={kpi.code}
            className={cn(
              "p-6 rounded-[18px] backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
              "bg-card/50 border border-blue-500/20"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", iconBgClass)}>
                <Icon className={cn("h-5 w-5", iconColorClass)} />
              </div>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-mono font-medium",
                isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {isPositive ? '+' : ''}{kpi.cumulative_percent.toFixed(2)}%
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground line-clamp-1" title={kpi.label}>
                {kpi.label}
              </p>
              <h3 className={cn(
                "text-2xl font-bold tracking-tight",
                percentColorClass
              )}>
                {isPositive ? '+' : ''}{kpi.cumulative_percent.toFixed(2)}%
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('kpi.cumulativeChange')}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

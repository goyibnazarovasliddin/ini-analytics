
import { useState, useMemo } from 'react';
import { FilterState } from '../pages/DashboardPage';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { Card } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Layers } from 'lucide-react';

interface ChartSectionProps {
  filters: FilterState;
  data: any[]; // Using any[] to match the transformed data from DashboardPage
}

type ChartType = 'line' | 'bar' | 'area' | 'stacked';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/50 p-3 rounded-xl shadow-xl min-w-[200px] text-xs max-h-[300px] overflow-y-auto thin-scrollbar">
        <p className="font-semibold mb-2 text-foreground">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const value = Number(entry.value);
            const isPositive = value >= 0;
            const valueColorClass = isPositive ? 'text-emerald-500' : 'text-red-500';

            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className={`font-mono font-medium ${valueColorClass}`}>
                  {isPositive ? '+' : ''}{value.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function ChartSection({ filters, data }: ChartSectionProps) {
  const { t, language } = useLanguage();
  const [chartType, setChartType] = useState<ChartType>('line');

  // Transform data for Recharts: array of objects { month, series1: val, series2: val ... }
  const chartData = useMemo(() => {
    if (!data.length) return [];

    // Get all unique month keys from the data
    const allMonths = new Set<string>();
    data.forEach(series => {
      Object.keys(series.monthlyData).forEach(m => allMonths.add(m));
    });

    // Sort months
    const sortedMonths = Array.from(allMonths).sort();

    // Filter months by date range
    // filters.dateRange.start/end format is "2024-M01"
    const start = filters.dateRange.start;
    const end = filters.dateRange.end;

    const relevantMonths = sortedMonths.filter(m => m >= start && m <= end);

    return relevantMonths.map(month => {
      const point: any = { month };
      data.forEach(series => {
        // Use code or label relative to language as key?
        // Using code is safer for uniqueness, but we want to show label in tooltip.
        // We'll use the label as the key for display simplicity in Recharts, 
        // assuming labels are unique enough or combining code+label.
        const label = language === 'uz' ? series.nameUz : language === 'ru' ? series.nameRu : series.nameEn;
        const displayKey = `${series.code} ${label}`;
        point[displayKey] = series.monthlyData[month] || 0;
      });
      return point;
    });
  }, [filters.dateRange, data, language]);

  const seriesKeys = useMemo(() => {
    if (!data.length) return [];
    return data.map(series => {
      const label = language === 'uz' ? series.nameUz : language === 'ru' ? series.nameRu : series.nameEn;
      return `${series.code} ${label}`;
    });
  }, [data, language]);

  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

  const renderChart = () => {
    const CommonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const ChartComponents = {
      line: LineChart,
      bar: BarChart,
      area: AreaChart,
      stacked: BarChart
    };

    const SelectedChart = ChartComponents[chartType];

    const isStacked = chartType === 'stacked';

    return (
      <SelectedChart {...CommonProps}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          dx={-10}
          label={{ value: '%', position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />

        {seriesKeys.map((key, index) => {
          const color = colors[index % colors.length];

          if (chartType === 'area') {
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={color}
                fill={color}
                fillOpacity={0.6}
              />
            );
          }

          if (chartType === 'bar' || chartType === 'stacked') {
            return (
              <Bar
                key={key}
                dataKey={key}
                stackId={isStacked ? "a" : undefined}
                fill={color}
                radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              />
            );
          }

          // Default Line
          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 0, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          );
        })}
      </SelectedChart>
    );
  };

  if (data.length === 0) {
    return (
      <Card className="p-12 rounded-[18px] bg-card/50 border-border/50">
        <div className="text-center text-muted-foreground flex flex-col items-center">
          <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
          <p>{t('chart.emptyState')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-[18px] bg-card/50 border-border/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{t('chart.title')}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {filters.dateRange.start} — {filters.dateRange.end}
          </p>
        </div>

        <ToggleGroup
          type="single"
          value={chartType}
          onValueChange={(value) => {
            if (value) setChartType(value as ChartType);
          }}
          className="bg-secondary/50 p-1 rounded-lg border border-transparent"
        >
          <ToggleGroupItem value="line" className="px-3 py-1.5 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
            <LineChartIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="bar" className="px-3 py-1.5 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="area" className="px-3 py-1.5 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
            <AreaChartIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="stacked" className="px-3 py-1.5 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
            <Layers className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 border-t border-border/50 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {language === 'uz' ? 'Afsona' : language === 'ru' ? 'Легенда' : 'Legend'}
            <span className="ml-1 text-primary">({seriesKeys.length})</span>
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-2 thin-scrollbar">
          {seriesKeys.map((key, index) => {
            const color = colors[index % colors.length];
            const firstSpaceIdx = key.indexOf(' ');
            const code = key.substring(0, firstSpaceIdx);
            const name = key.substring(firstSpaceIdx + 1);

            return (
              <div key={key} className="flex items-center gap-2 text-xs p-1.5 rounded-lg border border-transparent hover:bg-secondary/50 hover:border-border/50 transition-all select-none group">
                <span className="w-2 h-2 rounded-full shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all" style={{ backgroundColor: color }}></span>
                <span className="font-mono font-bold text-primary shrink-0">{code}</span>
                <span className="truncate text-foreground/70 group-hover:text-foreground transition-colors" title={name}>{name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  );
}

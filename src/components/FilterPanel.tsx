import { useState, useEffect } from 'react';
import { FilterState, IndicatorType } from '../pages/DashboardPage';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { useRefresh } from '../lib/contexts/RefreshContext';
import { apiClient, Classifier } from '../lib/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { X, ChevronsUpDown, Calendar, Trash2, Check } from 'lucide-react';
import { cn } from './ui/utils';
import { getAvailableMonths } from '../lib/mockData';

interface FilterPanelProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  const { t, language } = useLanguage();
  const { isRefreshing } = useRefresh();
  const [classifiers, setClassifiers] = useState<Classifier[]>([]);
  const [loadingClassifiers, setLoadingClassifiers] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  const [availableMonths, setAvailableMonths] = useState<string[]>(getAvailableMonths());

  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await apiClient.getSourceMetadata();
        if (meta.available_period_min && meta.available_period_max) {
          // Parse min/max: "2016-01" / "2025-01"
          // Generate array of "YYYY-Mmm"
          const start = new Date(meta.available_period_min + "-01");
          const end = new Date(meta.available_period_max + "-01");
          const list = [];
          let curr = new Date(start);
          while (curr <= end) {
            const y = curr.getFullYear();
            const m = (curr.getMonth() + 1).toString().padStart(2, '0');
            list.push(`${y}-M${m}`);
            curr.setMonth(curr.getMonth() + 1);
          }
          setAvailableMonths(list);
        }
      } catch (e) {
        console.error("Failed to load metadata", e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function loadClassifiers() {
      setLoadingClassifiers(true);
      try {
        // Fetch all classifiers
        const res = await apiClient.getClassifiers({ limit: 10000, lang: language });
        setClassifiers(res.classifiers);
      } catch (e) {
        console.error("Failed to load classifiers", e);
      } finally {
        setLoadingClassifiers(false);
      }
    }
    loadClassifiers();
  }, [language]);

  // LIVE UPDATE HANDLERS
  const handleReset = () => {
    setFilters({
      selectedClassifiers: ['1', '1.02', '1.03', '1.04'],
      dateRange: {
        start: availableMonths[0],
        end: availableMonths[availableMonths.length - 1],
      },
      indicatorType: 'cumulative',
      percentageOnly: true, // Internal default, though UI hidden
    });
  };

  const updateFilter = (partial: Partial<FilterState>) => {
    setFilters({ ...filters, ...partial });
  };

  const toggleClassifier = (code: string) => {
    const current = filters.selectedClassifiers;
    const newSelected = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code];

    updateFilter({ selectedClassifiers: newSelected });
  };

  const selectAllClassifiers = () => {
    const allCodes = classifiers.map(c => c.code);
    updateFilter({ selectedClassifiers: allCodes });
  };

  const clearClassifiers = () => {
    updateFilter({ selectedClassifiers: [] });
  };

  const removeClassifier = (code: string) => {
    updateFilter({
      selectedClassifiers: filters.selectedClassifiers.filter(c => c !== code),
    });
  };

  const getClassifierName = (code: string) => {
    const cls = classifiers.find(c => c.code === code);
    return cls ? cls.label : code;
  };

  return (
    <Card className={cn(
      "p-4 rounded-[18px] border border-border shadow-sm bg-card/50 backdrop-blur-sm",
      isRefreshing && "pointer-events-none opacity-50"
    )}>
      <div className="flex flex-col gap-6">

        {/* Top Row: Date Pickers + Metric + Reset */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Date Range - Side by Side */}
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:w-[200px] space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('filter.startDate')}</Label>
              <Select
                value={filters.dateRange.start}
                onValueChange={(val: string) => updateFilter({ dateRange: { ...filters.dateRange, start: val } })}
              >
                <SelectTrigger className="h-[42px] rounded-xl bg-background border-input hover:border-primary/50 transition-colors">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder={t('filter.startDate')} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableMonths.map(m => (
                    <SelectItem key={`s-${m}`} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 lg:w-[200px] space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('filter.endDate')}</Label>
              <Select
                value={filters.dateRange.end}
                onValueChange={(val: string) => updateFilter({ dateRange: { ...filters.dateRange, end: val } })}
              >
                <SelectTrigger className="h-[42px] rounded-xl bg-background border-input hover:border-primary/50 transition-colors">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder={t('filter.endDate')} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableMonths.map(m => (
                    <SelectItem key={`e-${m}`} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metric Type Pills */}
          <div className="space-y-1.5 flex-1 w-full">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('filter.indicatorType')}</Label>
            <ToggleGroup
              type="single"
              value={filters.indicatorType}
              onValueChange={(val: string) => val && updateFilter({ indicatorType: val as IndicatorType })}
              className="bg-secondary/50 p-1 rounded-xl border border-transparent w-full lg:w-fit h-[42px] flex items-center"
            >
              {[
                { value: 'mom', label: 'MoM' },
                { value: 'yoy', label: 'YoY' },
                { value: 'cumulative', label: 'Cumulative' }
              ].map(item => (
                <ToggleGroupItem
                  key={item.value}
                  value={item.value}
                  className="flex-1 lg:flex-none rounded-lg px-6 h-full text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-[0_0_10px_rgba(22,163,74,0.4)] transition-all flex items-center justify-center"
                >
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Reset Button */}
          {/* Reset Button */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider opacity-0 select-none">Action</Label>
            <Button
              variant="ghost"
              onClick={handleReset}
              className="rounded-xl h-[42px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('filter.reset')}
            </Button>
          </div>
        </div>

        {/* Classifier Search - Full Width */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('filter.classifiers')}</Label>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between rounded-xl h-[50px] bg-background border-input hover:border-primary/50 text-left px-4"
              >
                <span className="text-muted-foreground font-normal">
                  {filters.selectedClassifiers.length > 0
                    ? `${filters.selectedClassifiers.length} ${t('filter.itemsSelected')}`
                    : t('filter.classifierSearchPlaceholder')}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl border-border bg-card shadow-2xl" align="start">
              <Command className="rounded-xl">
                <CommandInput placeholder={t('filter.classifierSearchPlaceholder')} className="h-12" />

                {/* Select All / Clear Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-secondary/10">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all-cls"
                      checked={filters.selectedClassifiers.length === classifiers.length && classifiers.length > 0}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) selectAllClassifiers();
                        else clearClassifiers();
                      }}
                    />
                    <label htmlFor="select-all-cls" className="text-sm font-medium cursor-pointer select-none">{t('filter.selectAll')}</label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearClassifiers}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    {t('filter.clear')}
                  </Button>
                </div>

                <CommandList className="max-h-[400px]">
                  <CommandEmpty>{t('filter.noResults')}</CommandEmpty>
                  <CommandGroup>
                    {classifiers.map((cls) => {
                      const isSelected = filters.selectedClassifiers.includes(cls.code);
                      return (
                        <CommandItem
                          key={cls.code}
                          value={`${cls.code} ${cls.label}`}
                          onSelect={() => toggleClassifier(cls.code)}
                          className="cursor-pointer aria-selected:bg-secondary"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={cn(
                              "h-4 w-4 rounded border border-primary flex items-center justify-center transition-colors",
                              isSelected ? "bg-primary border-primary" : "bg-transparent"
                            )}>
                              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <span className="font-mono text-xs text-primary/80 w-14 shrink-0 font-bold">{cls.code}</span>
                            <span className="truncate">{cls.label}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Chips Display */}
          {filters.selectedClassifiers.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  {language === 'uz' ? 'Tanlanganlar' : language === 'ru' ? 'Выбрано' : 'Selected'}: <span className="text-primary">{filters.selectedClassifiers.length}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1 thin-scrollbar">
                {filters.selectedClassifiers.map(code => (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="rounded-lg px-2.5 py-1 text-xs font-normal border border-border/50 bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="font-mono text-primary mr-1.5 font-bold">{code}</span>
                    <span className="truncate max-w-[200px]">{getClassifierName(code)}</span>
                    <button onClick={() => removeClassifier(code)} className="ml-2 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

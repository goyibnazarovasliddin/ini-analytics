import { useLanguage } from '../lib/contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Calculator, TrendingUp, Layers, Database, RefreshCw } from 'lucide-react';

export function MethodologyPage() {
  const { t } = useLanguage();

  const metrics = [
    {
      title: t('methodology.mom'),
      description: t('methodology.momDesc'),
      formula: t('methodology.momFormula'),
      legend: t('methodology.momLegend'),
      icon: Calculator,
      color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    },
    {
      title: t('methodology.yoy'),
      description: t('methodology.yoyDesc'),
      formula: t('methodology.yoyFormula'),
      legend: t('methodology.yoyLegend'),
      icon: TrendingUp,
      color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    },
    {
      title: t('methodology.cumulative'),
      description: t('methodology.cumulativeDesc'),
      formula: t('methodology.cumulativeFormula'),
      legend: t('methodology.cumulativeLegend'),
      icon: Layers,
      color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    },
  ];

  const systemSections = [
    {
      title: t('methodology.requirements'),
      description: t('methodology.requirementsDesc'),
      icon: Database,
      color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    },
    {
      title: t('methodology.processing'),
      description: t('methodology.processingDesc'),
      icon: RefreshCw,
      color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('methodology.title')}</h1>
        <p className="text-muted-foreground leading-relaxed">
          {t('methodology.authority')}
        </p>
      </div>

      {/* Metric explanation cards */}
      <h2 className="text-xl font-semibold mt-8 mb-4">{t('filter.indicatorType')}</h2>
      <div className="grid gap-6 md:grid-cols-1">
        {metrics.map((method, index) => (
          <Card key={index} className="p-8 rounded-[24px] border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`inline-flex rounded-xl p-3 ${method.color}`}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{method.title}</h3>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {method.description}
                </p>
                <div className="pt-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Legend</p>
                  <p className="text-sm text-muted-foreground italic">
                    {method.legend}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="relative p-6 rounded-2xl bg-secondary/30 border border-primary/10 flex items-center justify-center min-h-[120px] overflow-x-auto">
                  <div className="absolute top-2 left-3 text-[10px] font-bold text-primary/40 uppercase tracking-tighter">Formula</div>
                  <code className="text-lg md:text-xl font-mono text-primary text-center whitespace-nowrap px-4 py-2">
                    {method.formula}
                  </code>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* System and Requirements sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {systemSections.map((section, index) => (
          <Card key={index} className="p-6 rounded-[18px] border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className={`inline-flex rounded-xl p-3 ${section.color} shrink-0`}>
                <section.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{section.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Data Source Section */}
      <Card className="p-8 rounded-[18px] border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Database className="h-32 w-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            {t('methodology.dataSource')}
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground w-32 shrink-0">Provider</span>
              <span className="text-base text-foreground font-medium">{t('methodology.dataSourceText')}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground w-32 shrink-0">Reference</span>
              <span className="text-sm font-mono bg-secondary/50 px-3 py-1 rounded-lg border border-border/50 text-foreground">
                {t('methodology.fileName')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom professional section */}
      <Card className="p-8 rounded-[24px] border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-2/3 space-y-4">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {t('methodology.finalNoteTitle')}
            </h3>
            <div className="h-1 w-20 bg-primary rounded-full" />
            <p className="text-base text-muted-foreground leading-relaxed text-justify italic">
              "{t('methodology.finalNoteContent')}"
            </p>
          </div>
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Standard Compliance</div>
              <div className="text-sm font-medium text-foreground">IMF & ILO Guidelines</div>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Update Policy</div>
              <div className="text-sm font-medium text-foreground">Immediate Monthly Post-Release</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

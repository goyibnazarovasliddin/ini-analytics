import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PeriodUtils } from '../../common/utils/periods';

type MetricType = 'mom' | 'yoy' | 'cumulative';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getKPI(startStr: string, endStr: string, lang: string) {
        // KPI codes: 1, 1.02, 1.03, 1.04
        const kpiCodes = ['1', '1.02', '1.03', '1.04'];
        const start = PeriodUtils.parsePeriodToDate(startStr);
        const end = PeriodUtils.parsePeriodToDate(endStr);

        const kpis = [];

        for (const code of kpiCodes) {
            // 1. Get Multi-Name for label
            const classifier = await this.prisma.classifier.findUnique({
                where: { code },
                select: { name_uz: true, name_ru: true, name_en: true, name_uzc: true }
            });

            const label = this.getLabel(classifier, lang);

            // 2. Calculate Cumulative for Range
            const rangeData = await this.prisma.monthlyIndex.findMany({
                where: {
                    classifier_code: code,
                    period: { gte: start, lte: end }
                },
                orderBy: { period: 'asc' }
            });

            let cumulativeVal = 100;
            if (rangeData.length > 0) {
                // formula: Product(index/100) * 100
                const product = rangeData.reduce((acc, curr) => acc * (curr.index_value / 100), 1);
                cumulativeVal = product * 100;
            }
            const cumulativePercent = cumulativeVal - 100;

            // 3. Get Last Month MoM (from the very last available month in range)
            // If range is empty, try to get absolute latest? No, strict to range.
            let lastMonthMom = 0;
            if (rangeData.length > 0) {
                const lastRec = rangeData[rangeData.length - 1];
                lastMonthMom = lastRec.index_value - 100;
            }

            kpis.push({
                code,
                label: label || code,
                cumulative_percent: Number(cumulativePercent.toFixed(2)),
                last_month_mom_percent: Number(lastMonthMom.toFixed(2))
            });
        }

        return {
            start: PeriodUtils.formatDateToPeriod(start), // Return YYYY-MM
            end: PeriodUtils.formatDateToPeriod(end),
            kpis
        };
    }

    async getSeries(codes: string[], startStr: string, endStr: string, metric: MetricType, lang: string) {
        const start = PeriodUtils.parsePeriodToDate(startStr);
        const end = PeriodUtils.parsePeriodToDate(endStr);

        // Prepare periods array (x-axis)
        const periods: Date[] = [];
        let curr = new Date(start);
        while (curr <= end) {
            periods.push(new Date(curr));
            curr = PeriodUtils.addMonths(curr, 1);
        }

        // Convert to strings for response
        const periodStrings = periods.map(p => PeriodUtils.formatDateToPeriod(p));

        const series = [];

        // Optimize: Fetch all data at once or per code? Per code is safer for logic complexity, but slower.
        // Given low volume, per code is fine.

        for (const code of codes) {
            const classifier = await this.prisma.classifier.findUnique({
                where: { code },
                select: { name_uz: true, name_ru: true, name_en: true, name_uzc: true }
            });
            const label = this.getLabel(classifier, lang) || code;

            let values: (number | null)[] = [];

            if (metric === 'mom') {
                const data = await this.prisma.monthlyIndex.findMany({
                    where: { classifier_code: code, period: { gte: start, lte: end } },
                    orderBy: { period: 'asc' }
                });
                // Map data to period slots
                values = periods.map(p => {
                    const match = data.find(d => d.period.getTime() === p.getTime());
                    return match ? Number((match.index_value - 100).toFixed(2)) : null;
                });

            } else if (metric === 'cumulative') {
                const data = await this.prisma.monthlyIndex.findMany({
                    where: { classifier_code: code, period: { gte: start, lte: end } },
                    orderBy: { period: 'asc' }
                });

                let runningProduct = 1;

                values = periods.map(p => {
                    const match = data.find(d => d.period.getTime() === p.getTime());
                    if (match) {
                        runningProduct *= (match.index_value / 100);
                        return Number(((runningProduct * 100) - 100).toFixed(2));
                    } else {
                        return null;
                    }
                });

            } else if (metric === 'yoy') {
                // Fetch data starting 12 months before 'start' to ensure we have enough history for the first point
                const lookbackStart = PeriodUtils.addMonths(start, -12);

                const data = await this.prisma.monthlyIndex.findMany({
                    where: { classifier_code: code, period: { gte: lookbackStart, lte: end } },
                    orderBy: { period: 'asc' }
                });

                values = periods.map(p => {
                    // Calculate "Cumulative" for the last 12 months [p-11, p]
                    // This creates a rolling 12-month window
                    const windowEnd = new Date(p);
                    const windowStart = PeriodUtils.addMonths(windowEnd, -11);

                    // Filter data points that fall within this 12-month window
                    // We check: windowStart <= d.period <= windowEnd
                    const windowData = data.filter(d =>
                        d.period.getTime() >= windowStart.getTime() &&
                        d.period.getTime() <= windowEnd.getTime()
                    );

                    if (windowData.length > 0) {
                        // Apply the Cumulative Formula: (Product(index/100) - 1) * 100
                        const product = windowData.reduce((acc, curr) => acc * (curr.index_value / 100), 1);
                        return Number(((product * 100) - 100).toFixed(2));
                    }

                    return null;
                });
            }

            series.push({ code, label, values });
        }

        return { periods: periodStrings, series };
    }

    async getTable(params: { codes?: string[], start: string, end: string, metric: string, lang: string, page: number, pageSize: number }) {
        const { codes, start, end, metric, lang, page, pageSize } = params;

        // Re-use getSeries logic but for paginated codes
        // 1. Get total codes
        let targetCodes = codes;
        let total = 0;

        if (!targetCodes || targetCodes.length === 0) {
            // If no codes provided, maybe fetch all top level? Or all?
            // Guide implies "all" if empty, but usually that's too much.
            // Let's assume pagination over ALL classifiers.
            const totalCount = await this.prisma.classifier.count();
            total = totalCount;

            const codeRecs = await this.prisma.classifier.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { code: 'asc' },
                select: { code: true }
            });
            targetCodes = codeRecs.map(c => c.code);
        } else {
            total = targetCodes.length;
            // Apply manual pagination to the provided list if needed, 
            // but usually if codes are provided explicitly, we just return them. 
            // However, the interface asks for pagination.
            const startIdx = (page - 1) * pageSize;
            targetCodes = targetCodes.slice(startIdx, startIdx + pageSize);
        }

        // 2. Get Series
        // Note: This calls getSeries for the page slice.
        const seriesData = await this.getSeries(targetCodes, start, end, metric as MetricType, lang);

        // 3. Transform to Table format
        const periods = seriesData.periods;
        const rows = seriesData.series.map(s => {
            const valMap = {};
            s.values.forEach((v, idx) => {
                valMap[periods[idx]] = v;
            });
            return {
                code: s.code,
                label: s.label,
                values: valMap
            };
        });

        // Front expects "yyyy-Mmm" in the rows? 
        // Guide: "values: { '2024-M01': 0.64 }"
        // My getSeries returns "2024-01".
        // I should convert the keys in `values` map to User Friendly format if requested, 
        // BUT Guide says Backend API uses ISO "2024-01". 
        // I will stick to ISO in the values keys to match the `periods` array.

        return {
            periods,
            rows,
            pagination: {
                page,
                page_size: pageSize,
                total,
                total_pages: Math.ceil(total / pageSize)
            }
        };
    }

    private getLabel(classifier: any, lang: string): string {
        if (!classifier) return '';
        switch (lang) {
            case 'ru': return classifier.name_ru || classifier.name_uz;
            case 'en': return classifier.name_en || classifier.name_uz;
            case 'uzc': return classifier.name_uzc || classifier.name_uz;
            default: return classifier.name_uz;
        }
    }
}

import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx'; // Basic CSV also possible, but ExcelJS is robust

@Injectable()
export class ExportService {
    constructor(
        private analyticsService: AnalyticsService,
        private prisma: PrismaService
    ) { }

    async generateExport(format: 'csv' | 'xlsx', params: any) {
        let { codes, start, end, metric, lang } = params;
        const codesList = codes ? codes.split(',') : [];

        // If no codes, fetch ALL codes (sorted)
        let finalCodes = codesList;
        if (finalCodes.length === 0) {
            const allCodes = await this.prisma.classifier.findMany({
                orderBy: { code: 'asc' },
                select: { code: true }
            });
            finalCodes = allCodes.map(c => c.code);
        }

        // Get Data
        const data = await this.analyticsService.getSeries(finalCodes, start, end, metric, lang);

        // Create Workbook
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Export');

        // Headers: Code, Label, ...Periods
        const headers = ['Code', 'Label', ...data.periods];
        sheet.addRow(headers);

        // Rows
        data.series.forEach(series => {
            const row = [series.code, series.label, ...series.values];
            sheet.addRow(row);
        });

        if (format === 'xlsx') {
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer;
        } else {
            const buffer = await workbook.csv.writeBuffer();
            return buffer;
        }
    }
}

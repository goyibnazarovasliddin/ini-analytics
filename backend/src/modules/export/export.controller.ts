import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';

@Controller('export')
export class ExportController {
    constructor(private readonly service: ExportService) { }

    @Get()
    async exportData(@Query() query: any, @Res() res: Response) {
        const format = query.format || 'xlsx';

        const buffer = await this.service.generateExport(format, query);

        const filename = `export_${query.metric}_${query.start}_${query.end}.${format}`;

        if (format === 'xlsx') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } else {
            res.setHeader('Content-Type', 'text/csv');
        }

        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buffer);
    }
}

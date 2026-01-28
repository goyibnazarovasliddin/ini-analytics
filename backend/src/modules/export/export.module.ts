import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
    imports: [AnalyticsModule],
    controllers: [ExportController],
    providers: [ExportService],
})
export class ExportModule { }

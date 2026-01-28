import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { MetaModule } from './modules/meta/meta.module';
import { ClassifiersModule } from './modules/classifiers/classifiers.module';
import { IngestModule } from './modules/ingest/ingest.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ExportModule } from './modules/export/export.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        MetaModule,
        ClassifiersModule,
        IngestModule,
        AnalyticsModule,
        ExportModule,
    ],
})
export class AppModule { }

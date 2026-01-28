import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { IsOptional, IsString, IsArray, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class KPIQueryDto {
    @IsString() start: string;
    @IsString() end: string;
    @IsOptional() @IsString() lang?: string;
}

class SeriesQueryDto {
    @IsString() start: string;
    @IsString() end: string;
    @IsString() codes: string; // Comma separated
    @IsString() metric: 'mom' | 'yoy' | 'cumulative';
    @IsOptional() @IsString() lang?: string;
}

class TableQueryDto {
    @IsString() start: string;
    @IsString() end: string;
    @IsOptional() @IsString() codes?: string;
    @IsString() metric: 'mom' | 'yoy' | 'cumulative';
    @IsOptional() @IsString() lang?: string;
    @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
    @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page_size?: number = 50;
}

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly service: AnalyticsService) { }

    @Get('kpi')
    getKPI(@Query() query: KPIQueryDto) {
        return this.service.getKPI(query.start, query.end, query.lang || 'uz');
    }

    @Get('series')
    getSeries(@Query() query: SeriesQueryDto) {
        const codes = query.codes.split(',').map(c => c.trim()).filter(c => c);
        return this.service.getSeries(codes, query.start, query.end, query.metric, query.lang || 'uz');
    }

    @Get('table')
    getTable(@Query() query: TableQueryDto) {
        const codes = query.codes ? query.codes.split(',').map(c => c.trim()) : [];
        return this.service.getTable({
            ...query,
            codes,
            page: query.page || 1,
            pageSize: query.page_size || 50,
            lang: query.lang || 'uz'
        });
    }
}

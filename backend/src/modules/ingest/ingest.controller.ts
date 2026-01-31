import { Controller, Post, Get, Param, Headers, UnauthorizedException, HttpCode, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { IngestService } from './ingest.service';

@Controller('admin')
export class IngestController {
    constructor(private readonly ingestService: IngestService) { }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Headers('X-ADMIN-KEY') adminKey: string | undefined) {
        const validKey = process.env.ADMIN_KEY;
        if (!validKey || adminKey !== validKey) {
            throw new UnauthorizedException('Invalid Admin Key');
        }

        const sourceUrl = process.env.SOURCE_URL;
        if (!sourceUrl) {
            throw new UnauthorizedException('SOURCE_URL not configured');
        }

        // Create job
        const job = await this.ingestService.createRefreshJob();

        // Start refresh in background (don't await)
        this.ingestService.refreshData(sourceUrl, job.id).catch(err => {
            console.error('Background refresh failed:', err);
        });

        // Return job ID immediately
        return {
            jobId: job.id,
            status: job.status
        };
    }

    @Get('refresh/:jobId')
    async getRefreshStatus(@Param('jobId') jobId: string) {
        return this.ingestService.getJobStatus(jobId);
    }

    @Post('upload-history')
    @UseInterceptors(FileInterceptor('file'))
    async uploadHistory(
        @UploadedFile() file: Express.Multer.File,
        @Headers('X-ADMIN-KEY') adminKey: string | undefined,
        @Headers('X-UPLOAD-PASSWORD') uploadPassword: string | undefined
    ) {
        // 1. General Admin Key Check (Basic Auth)
        const validKey = process.env.ADMIN_KEY;
        if (!validKey || adminKey !== validKey) {
            throw new UnauthorizedException('Invalid Admin Key');
        }

        // 2. Specific Upload Password Check
        if (uploadPassword !== 'c0d3c0r3-cbu-admin') {
            throw new UnauthorizedException('Invalid Upload Password');
        }

        if (!file) {
            throw new UnauthorizedException('File is missing');
        }

        // Create job
        const job = await this.ingestService.createRefreshJob();

        // Start processing
        this.ingestService.processHistoryFile(file.buffer, job.id).catch(err => {
            console.error('History upload failed:', err);
        });

        return {
            jobId: job.id,
            status: job.status
        };
    }
}

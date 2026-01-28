import { Controller, Post, Get, Param, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
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
}

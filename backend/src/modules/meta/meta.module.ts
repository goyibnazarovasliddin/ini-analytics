import { Module, Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('meta')
export class MetaController {
    constructor(private prisma: PrismaService) { }

    @Get('source')
    async getSource() {
        const lastRun = await this.prisma.ingestionRun.findFirst({
            where: { status: 'SUCCESS' },
            orderBy: { fetched_at: 'desc' }
        });

        const [minDateRec, maxDateRec] = await Promise.all([
            this.prisma.monthlyIndex.findFirst({ orderBy: { period: 'asc' } }),
            this.prisma.monthlyIndex.findFirst({ orderBy: { period: 'desc' } })
        ]);

        const count = await this.prisma.classifier.count();

        const formatDate = (d: Date | null) => {
            if (!d) return null;
            const y = d.getFullYear();
            const m = (d.getMonth() + 1).toString().padStart(2, '0');
            return `${y}-${m}`;
        };

        return {
            source_url: process.env.SOURCE_URL,
            last_fetched_at: lastRun ? lastRun.fetched_at.toISOString() : null,
            available_period_min: minDateRec ? formatDate(minDateRec.period) : null,
            available_period_max: maxDateRec ? formatDate(maxDateRec.period) : null,
            total_classifiers: count,
            total_indices: await this.prisma.monthlyIndex.count()
        };
    }
}

@Module({
    controllers: [MetaController]
})
export class MetaModule { }

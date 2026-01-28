import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ClassifiersService {
    constructor(private prisma: PrismaService) { }

    async findAll(q?: string, lang: string = 'uz', limit: number = 100, offset: number = 0) {
        const where: any = {};
        if (q) {
            where.OR = [
                { code: { contains: q, mode: 'insensitive' } },
                { name_uz: { contains: q, mode: 'insensitive' } },
                { name_ru: { contains: q, mode: 'insensitive' } },
                { name_en: { contains: q, mode: 'insensitive' } },
            ];
        }

        const [total, items] = await Promise.all([
            this.prisma.classifier.count({ where }),
            this.prisma.classifier.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { code: 'asc' }
            })
        ]);

        // Map to frontend expectation
        const classifiers = items.map(item => {
            let label = item.name_uz;
            if (lang === 'ru') label = item.name_ru || label;
            if (lang === 'en') label = item.name_en || label;
            if (lang === 'uzc') label = item.name_uzc || label;

            return {
                code: item.code,
                label,
                name_uz: item.name_uz,
                name_ru: item.name_ru,
                name_en: item.name_en,
                name_uzc: item.name_uzc,
                parent_code: item.parent_code
            };
        });

        return { classifiers, total };
    }
}

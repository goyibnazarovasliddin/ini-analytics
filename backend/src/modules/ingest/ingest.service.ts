import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { PeriodUtils } from '../../common/utils/periods';

@Injectable()
export class IngestService {
    private readonly logger = new Logger(IngestService.name);

    constructor(private prisma: PrismaService) { }

    async refreshData(sourceUrl: string, jobId: string) {
        this.logger.log(`Starting ingestion from ${sourceUrl} (Job: ${jobId})`);
        const startTime = new Date();

        try {
            // Update job to RUNNING
            await this.prisma.refreshJob.update({
                where: { id: jobId },
                data: { status: 'RUNNING' }
            });

            // 1. Download File
            const response = await axios.get(sourceUrl, { responseType: 'arraybuffer' });
            const data = new Uint8Array(response.data);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert to JSON with first row as keys
            const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

            if (jsonData.length === 0) {
                throw new Error('Excel file is empty');
            }

            this.logger.log(`Parsed ${jsonData.length} rows from Excel`);

            // 2. Identify Month Columns
            const firstRow = jsonData[0];
            const monthKeys = Object.keys(firstRow).filter(key =>
                /^\\d{4}-[MМ]\\d{2}$/.test(key)
            );

            this.logger.log(`Found ${monthKeys.length} month columns: ${monthKeys[0]} to ${monthKeys[monthKeys.length - 1]}`);

            // 3. Process Rows with Progress Tracking
            let processedCount = 0;

            // Sort by code length to ensure parents are created first
            const allCodes = new Set<string>();
            const validRows = [];

            for (const row of jsonData) {
                const getVal = (key: string) => {
                    const k = Object.keys(row).find(dk => dk.toLowerCase() === key.toLowerCase());
                    return k ? row[k] : null;
                };
                const code = getVal('Code') ? String(getVal('Code')).trim() : null;
                if (code) {
                    allCodes.add(code);
                    validRows.push({ row, code });
                }
            }

            validRows.sort((a, b) => {
                if (a.code.length !== b.code.length) {
                    return a.code.length - b.code.length;
                }
                return a.code.localeCompare(b.code);
            });

            const totalRows = validRows.length;
            await this.prisma.refreshJob.update({
                where: { id: jobId },
                data: { total_rows: totalRows }
            });

            for (const item of validRows) {
                const { row, code } = item;

                const getVal = (key: string) => {
                    const k = Object.keys(row).find(dk => dk.toLowerCase() === key.toLowerCase());
                    return k ? row[k] : null;
                };

                // Determine valid parent
                let parentCode = this.deriveParentCode(code);
                if (parentCode && !allCodes.has(parentCode)) {
                    parentCode = null;
                }

                // Upsert Classifier
                await this.prisma.classifier.upsert({
                    where: { code },
                    update: {
                        name_uz: getVal('Klassifikator') || null,
                        name_ru: getVal('Klassifikator_ru') || null,
                        name_en: getVal('Klassifikator_en') || null,
                        name_uzc: getVal('Klassifikator_uzc') || null,
                        parent_code: parentCode,
                    },
                    create: {
                        code,
                        name_uz: getVal('Klassifikator') || null,
                        name_ru: getVal('Klassifikator_ru') || null,
                        name_en: getVal('Klassifikator_en') || null,
                        name_uzc: getVal('Klassifikator_uzc') || null,
                        parent_code: parentCode,
                    }
                });

                // Upsert Monthly Indices
                for (const mKey of monthKeys) {
                    const rawVal = row[mKey];
                    if (rawVal === null || rawVal === undefined || rawVal === '') continue;

                    let valNum: number;
                    if (typeof rawVal === 'number') {
                        valNum = rawVal;
                    } else {
                        valNum = parseFloat(String(rawVal).replace(/,/g, '.'));
                    }

                    if (isNaN(valNum)) continue;

                    const normalizedKey = mKey.replace('М', 'M');
                    const periodDate = PeriodUtils.parsePeriodToDate(normalizedKey);

                    await this.prisma.monthlyIndex.upsert({
                        where: {
                            classifier_code_period: {
                                classifier_code: code,
                                period: periodDate
                            }
                        },
                        update: { index_value: valNum },
                        create: {
                            classifier_code: code,
                            period: periodDate,
                            index_value: valNum
                        }
                    });
                }

                processedCount++;

                // Update progress every 10 rows or on last row
                if (processedCount % 10 === 0 || processedCount === totalRows) {
                    const progress = Math.floor((processedCount / totalRows) * 100);
                    const elapsed = (new Date().getTime() - startTime.getTime()) / 1000; // seconds
                    const avgTimePerRow = elapsed / processedCount;
                    const remainingRows = totalRows - processedCount;
                    const etaSeconds = Math.ceil(avgTimePerRow * remainingRows);

                    await this.prisma.refreshJob.update({
                        where: { id: jobId },
                        data: {
                            progress,
                            processed_rows: processedCount,
                            eta_seconds: etaSeconds > 0 ? etaSeconds : 0
                        }
                    });
                }
            }

            // Record Success
            await this.prisma.ingestionRun.create({
                data: {
                    source_url: sourceUrl,
                    status: 'SUCCESS',
                    rows_loaded: processedCount,
                }
            });

            // Update job to SUCCESS
            await this.prisma.refreshJob.update({
                where: { id: jobId },
                data: {
                    status: 'SUCCESS',
                    progress: 100,
                    eta_seconds: 0,
                    completed_at: new Date()
                }
            });

            this.logger.log(`Ingestion complete. Processed ${processedCount} rows.`);
            return { success: true, rows: processedCount };

        } catch (e) {
            this.logger.error(`Ingestion failed: ${e.message}`);

            // Update job to ERROR
            await this.prisma.refreshJob.update({
                where: { id: jobId },
                data: {
                    status: 'ERROR',
                    error_message: e.message,
                    completed_at: new Date()
                }
            });

            await this.prisma.ingestionRun.create({
                data: {
                    source_url: sourceUrl,
                    status: 'ERROR',
                    error_message: e.message,
                }
            });
            throw new HttpException('Ingestion Failed: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getRefreshMetadata() {
        // Get latest successful ingestion
        const latestRun = await this.prisma.ingestionRun.findFirst({
            where: { status: 'SUCCESS' },
            orderBy: { fetched_at: 'desc' }
        });

        // Get period range
        const periodStats = await this.prisma.monthlyIndex.aggregate({
            _min: { period: true },
            _max: { period: true },
            _count: true
        });

        // Get classifier count
        const classifierCount = await this.prisma.classifier.count();

        return {
            ok: true,
            fetchedAt: latestRun?.fetched_at?.toISOString() || null,
            rowsLoaded: latestRun?.rows_loaded || 0,
            classifiersCount: classifierCount,
            periodsMin: periodStats._min.period?.toISOString().split('T')[0] || null,
            periodsMax: periodStats._max.period?.toISOString().split('T')[0] || null,
            totalIndices: periodStats._count || 0
        };
    }

    async createRefreshJob() {
        const job = await this.prisma.refreshJob.create({
            data: {
                status: 'PENDING',
                progress: 0,
                total_rows: 0,
                processed_rows: 0
            }
        });
        return job;
    }

    async getJobStatus(jobId: string) {
        const job = await this.prisma.refreshJob.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
        }

        return {
            id: job.id,
            status: job.status,
            progress: job.progress,
            total_rows: job.total_rows,
            processed_rows: job.processed_rows,
            eta_seconds: job.eta_seconds,
            error_message: job.error_message,
            started_at: job.started_at.toISOString(),
            completed_at: job.completed_at?.toISOString() || null
        };
    }

    async processHistoryFile(fileBuffer: Buffer, jobId: string) {
        this.logger.log(`Starting history ingestion (Job: ${jobId})`);

        // Start async processing
        this.processHistoryFileAsync(fileBuffer, jobId).catch(err => {
            this.logger.error(`History ingestion failed: ${err.message}`);
        });

        return { jobId };
    }

    private async processHistoryFileAsync(fileBuffer: Buffer, jobId: string) {
        const startTime = new Date();
        try {
            await this.prisma.refreshJob.update({
                where: { id: jobId },
                data: { status: 'RUNNING' }
            });

            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

            if (jsonData.length === 0) throw new Error('Excel file is empty');

            // 1. Get Existing Periods (Source of Truth)
            const existingPeriods = await this.prisma.monthlyIndex.findMany({
                select: { period: true },
                distinct: ['period']
            });
            const existingDates = new Set(existingPeriods.map(r => r.period.toISOString().slice(0, 7))); // YYYY-MM

            // 2. Identify Target Columns (only those NOT in DB)
            const firstRow = jsonData[0];
            const allMonthKeys = Object.keys(firstRow).filter(key => /^\\d{4}-[MМ]\\d{2}$/.test(key));

            const targetKeys = allMonthKeys.filter(key => {
                const normalized = key.replace('М', 'M'); // Handle Cyrillic M
                const date = PeriodUtils.parsePeriodToDate(normalized);
                const isoMonth = date.toISOString().slice(0, 7);
                return !existingDates.has(isoMonth);
            });

            if (targetKeys.length === 0) {
                await this.prisma.refreshJob.update({
                    where: { id: jobId },
                    data: {
                        status: 'SUCCESS',
                        progress: 100,
                        error_message: 'No new historical periods found. All dates in file already exist in DB.',
                        completed_at: new Date()
                    }
                });
                return;
            }

            this.logger.log(`Found ${targetKeys.length} new historical periods: ${targetKeys.join(', ')}`);

            // 3. Process Rows
            let processedCount = 0;
            const validRows = jsonData.filter(r => r['Code'] || r['code']);
            // Note: Case sensitivity check might be needed like in refreshData, but keeping simple for now or copying helper

            // Helper to safe get value
            const getVal = (row: any, key: string) => {
                const k = Object.keys(row).find(dk => dk.toLowerCase() === key.toLowerCase());
                return k ? row[k] : null;
            };

            const totalRows = validRows.length;
            await this.prisma.refreshJob.update({
                where: { id: jobId },
                data: { total_rows: totalRows }
            });

            const minDate = targetKeys[0];
            const maxDate = targetKeys[targetKeys.length - 1];

            for (const row of validRows) {
                const code = String(getVal(row, 'Code') || '').trim();
                if (!code) continue;

                // Ensure classifier exists (if strictly history file, classifiers might be missing? 
                // We should probably upsert classifier too just in case)
                // Reuse parent derivation logic
                let parentCode = this.deriveParentCode(code);
                // We won't strictly enforce parent existence check here to avoid complex "allCodes" set logic unless necessary,
                // but standard upsert is safer. 
                // Simplified: Just Upsert Classifier Name if provided

                await this.prisma.classifier.upsert({
                    where: { code },
                    update: {}, // Don't overwrite names from history if they exist? Or should we? Default to no update for safety.
                    create: {
                        code,
                        name_uz: getVal(row, 'Klassifikator') || null,
                        name_ru: getVal(row, 'Klassifikator_ru') || null,
                        name_en: getVal(row, 'Klassifikator_en') || null,
                        parent_code: parentCode
                    }
                });

                // Insert Indices for Target Keys
                for (const mKey of targetKeys) {
                    const rawVal = row[mKey];
                    if (rawVal === null || rawVal === undefined || rawVal === '') continue;

                    let valNum: number;
                    if (typeof rawVal === 'number') valNum = rawVal;
                    else valNum = parseFloat(String(rawVal).replace(/,/g, '.'));

                    if (isNaN(valNum)) continue;

                    const normalizedKey = mKey.replace('М', 'M');
                    const periodDate = PeriodUtils.parsePeriodToDate(normalizedKey);

                    // Force upsert
                    await this.prisma.monthlyIndex.upsert({
                        where: {
                            classifier_code_period: {
                                classifier_code: code,
                                period: periodDate
                            }
                        },
                        update: { index_value: valNum },
                        create: {
                            classifier_code: code,
                            period: periodDate,
                            index_value: valNum
                        }
                    });
                }

                processedCount++;
                if (processedCount % 10 === 0 || processedCount === totalRows) {
                    const progress = Math.floor((processedCount / totalRows) * 100);
                    // ETA logic...
                    await this.prisma.refreshJob.update({
                        where: { id: jobId },
                        data: { progress, processed_rows: processedCount }
                    });
                }
            }

            // Success
            await this.prisma.refreshJob.update({
                where: { id: jobId },
                data: {
                    status: 'SUCCESS',
                    progress: 100,
                    eta_seconds: 0,
                    completed_at: new Date(),
                    error_message: `Imported ${targetKeys.length} months (${minDate} to ${maxDate})`
                }
            });

        } catch (e) {
            this.logger.error(`History Processing Error: ${e.message}`);
            await this.prisma.refreshJob.update({
                where: { id: jobId },
                data: {
                    status: 'ERROR',
                    error_message: e.message,
                    completed_at: new Date()
                }
            });
        }
    }

    private deriveParentCode(code: string): string | null {
        if (!code.includes('.')) {
            // It's a top level code (e.g. "1")
            return null;
        }
        const parts = code.split('.');
        parts.pop();
        return parts.join('.');
    }
}

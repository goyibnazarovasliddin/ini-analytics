export class PeriodUtils {

    /**
     * Convert "YYYY-MM" or "YYYY-Mmm" string to Date object (1st of month)
     */
    static parsePeriodToDate(period: string): Date {
        if (!period) return new Date();

        // Handle "2024-M01" format
        let normalized = period.replace('M', '');

        // Handle "2024-1" -> "2024-01"
        const parts = normalized.split('-');
        if (parts.length === 2 && parts[1].length === 1) {
            normalized = `${parts[0]}-0${parts[1]}`;
        }

        return new Date(`${normalized}-01`);
    }

    /**
     * Convert Date object to "YYYY-MM" string
     */
    static formatDateToPeriod(date: Date): string {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${y}-${m}`;
    }

    /**
     * Convert Date object to "YYYY-Mmm" string (Frontend format)
     */
    static formatDateToFrontendPeriod(date: Date): string {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${y}-M${m}`;
    }

    /**
     * Get difference in months between two dates
     */
    static getMonthDiff(d1: Date, d2: Date): number {
        let months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    /**
     * Add months to a date
     */
    static addMonths(date: Date, months: number): Date {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    }
}

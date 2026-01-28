import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { FilterState } from '../pages/DashboardPage';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { CPIData, getAvailableMonths } from '../lib/mockData';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  filters: FilterState;
  data: any[];
}

export function DataTable({ filters, data }: DataTableProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // Get months in the selected range
  const monthsInRange = useMemo(() => {
    // START: Dynamic generation instead of mock data
    const normalizedStart = filters.dateRange.start.replace('M', ''); // 2024-M01 -> 2024-01
    const normalizedEnd = filters.dateRange.end.replace('M', '');

    const start = new Date(`${normalizedStart}-01`);
    const end = new Date(`${normalizedEnd}-01`);

    // Safety check if dates are invalid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    const list: string[] = [];
    let curr = new Date(start);

    while (curr <= end) {
      const y = curr.getFullYear();
      const m = (curr.getMonth() + 1).toString().padStart(2, '0');
      list.push(`${y}-M${m}`);
      curr.setMonth(curr.getMonth() + 1);
    }
    return list;
  }, [filters.dateRange]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) {
      setCurrentPage(1); // Reset to page 1 on search clear
      return data;
    }

    const query = searchQuery.toLowerCase();
    const result = data.filter(item => {
      // name might be missing if data transformation failed somewhere, but usually ok
      const nameUz = item.nameUz || '';
      const nameRu = item.nameRu || '';
      const nameEn = item.nameEn || '';

      return (
        item.code.toLowerCase().includes(query) ||
        nameUz.toLowerCase().includes(query) ||
        nameRu.toLowerCase().includes(query) ||
        nameEn.toLowerCase().includes(query)
      );
    });

    setCurrentPage(1); // Reset to page 1 on search
    return result;
  }, [data, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const exportToCSV = () => {
    const headers = [t('table.code'), t('table.classifier'), ...monthsInRange];
    const rows = filteredData.map(item => {
      const name = language === 'uz' ? item.nameUz : language === 'ru' ? item.nameRu : item.nameEn;
      const values = monthsInRange.map(month => {
        const val = item.monthlyData[month];
        return val !== null && val !== undefined ? val.toFixed(2) : '0';
      });
      return [item.code, `"${name}"`, ...values];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ini_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const headers = [t('table.code'), t('table.classifier'), ...monthsInRange];
    const rows = filteredData.map(item => {
      const name = language === 'uz' ? item.nameUz : language === 'ru' ? item.nameRu : item.nameEn;
      const values = monthsInRange.map(month => item.monthlyData[month] || 0);
      return [item.code, name, ...values];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, `ini_analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <Card className="p-0 rounded-[18px] bg-card border-border/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Search */}
        <div className="relative w-full sm:max-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('table.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-secondary/50 border-transparent hover:border-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline-block">{t('table.rows')}:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val: string) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[85px] rounded-xl bg-background/50 border-border/50 hover:bg-accent/50 transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="h-9 rounded-xl gap-2 border-border/50 hover:bg-primary/10 hover:text-primary transition-all pr-4"
            >
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="h-9 rounded-xl gap-2 border-border/50 hover:bg-primary/10 hover:text-primary transition-all pr-4"
            >
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-auto flex-1 min-h-[400px] w-full max-w-full">
        <Table className="relative w-max min-w-full border-collapse">
          <TableHeader className="bg-secondary/30 sticky top-0 z-20 backdrop-blur-md">
            <TableRow className="border-border/50 hover:bg-transparent">
              {/* 1. Row Number */}
              <TableHead className="w-[60px] text-center sticky left-0 z-30 bg-card border-r border-border/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                #
              </TableHead>
              {/* 2. Code */}
              <TableHead className="w-[80px] sticky left-[60px] z-30 bg-card font-bold text-primary border-r border-border/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {t('table.code')}
              </TableHead>
              {/* 3. Name */}
              <TableHead className="min-w-[300px] max-w-[400px] sticky left-[140px] z-30 bg-card border-r border-border/50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.2)]">
                {t('table.classifier')}
              </TableHead>

              {monthsInRange.map(month => (
                <TableHead key={month} className="min-w-[100px] text-right font-medium whitespace-nowrap px-4 border-r border-border/10">
                  {month}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const name = language === 'uz' ? item.nameUz : language === 'ru' ? item.nameRu : item.nameEn;
                const rowNum = startIndex + index + 1;

                return (
                  <TableRow key={item.code} className="border-border/30 hover:bg-secondary/20 transition-colors group">
                    {/* 1. Row Number */}
                    <TableCell className="text-center font-mono text-xs text-muted-foreground sticky left-0 z-10 bg-card group-hover:bg-secondary border-r border-border/10">
                      {rowNum}
                    </TableCell>
                    {/* 2. Code */}
                    <TableCell className="font-mono font-bold text-primary sticky left-[60px] z-10 bg-card group-hover:bg-secondary border-r border-border/10">
                      {item.code}
                    </TableCell>
                    {/* 3. Name */}
                    <TableCell className="sticky left-[140px] z-10 bg-card group-hover:bg-secondary border-r border-border/30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                      <span className="line-clamp-1">{name}</span>
                    </TableCell>

                    {monthsInRange.map(month => {
                      const value = item.monthlyData[month];
                      const isNull = value === null || value === undefined;
                      const isPositive = !isNull && value >= 0;

                      return (
                        <TableCell
                          key={month}
                          className={`text-right font-mono text-xs whitespace-nowrap px-4 border-r border-border/5 ${isNull ? 'text-muted-foreground' : (isPositive
                            ? 'text-emerald-500'
                            : 'text-red-500')
                            }`}
                        >
                          {isNull ? '—' : (
                            <>
                              {isPositive ? '+' : ''}{value.toFixed(2)}%
                            </>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3 + monthsInRange.length} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Pagination */}
      <div className="p-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/10">
        <div className="text-sm text-muted-foreground">
          <div>{t('table.showingLabel')} <span className="font-medium text-foreground">{filteredData.length > 0 ? startIndex + 1 : 0}</span> {t('table.from')} <span className="font-medium text-foreground">{endIndex}</span> {t('table.to')}</div>
          <div>{t('table.totalLabel')} <span className="font-medium text-foreground">{filteredData.length}</span> {t('table.totalCount')}</div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((pageNum, idx) => (
            pageNum === "..." ? (
              <span key={`dots-${idx}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={`page-${pageNum}`}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 rounded-lg p-0 font-mono ${currentPage === pageNum ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(22,163,74,0.3)]' : 'border-transparent bg-transparent hover:bg-secondary'}`}
                onClick={() => setCurrentPage(Number(pageNum))}
              >
                {pageNum}
              </Button>
            )
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

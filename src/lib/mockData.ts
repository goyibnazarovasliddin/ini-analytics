export interface CPIData {
  code: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  monthlyData: { [key: string]: number }; // Format: "2024-M01": value
}

// Generate mock CPI data
export const mockCPIData: CPIData[] = [
  {
    code: '1',
    nameUz: "Yig'ma indeks",
    nameRu: 'Сводный индекс',
    nameEn: 'Total Index',
    monthlyData: {
      '2024-M01': 0.85,
      '2024-M02': 1.12,
      '2024-M03': 1.34,
      '2024-M04': 1.56,
      '2024-M05': 1.78,
      '2024-M06': 1.92,
      '2024-M07': 2.15,
      '2024-M08': 2.34,
      '2024-M09': 2.56,
      '2024-M10': 2.78,
      '2024-M11': 2.92,
      '2024-M12': 3.15,
    },
  },
  {
    code: '1.02',
    nameUz: 'Oziq-ovqat mahsulotlari',
    nameRu: 'Продовольственные товары',
    nameEn: 'Food Products',
    monthlyData: {
      '2024-M01': 1.24,
      '2024-M02': 1.58,
      '2024-M03': 1.89,
      '2024-M04': 2.12,
      '2024-M05': 2.45,
      '2024-M06': 2.68,
      '2024-M07': 2.94,
      '2024-M08': 3.18,
      '2024-M09': 3.42,
      '2024-M10': 3.67,
      '2024-M11': 3.89,
      '2024-M12': 4.15,
    },
  },
  {
    code: '1.03',
    nameUz: 'Nooziq-ovqat mahsulotlari',
    nameRu: 'Непродовольственные товары',
    nameEn: 'Non-food Products',
    monthlyData: {
      '2024-M01': 0.52,
      '2024-M02': 0.78,
      '2024-M03': 0.95,
      '2024-M04': 1.18,
      '2024-M05': 1.34,
      '2024-M06': 1.56,
      '2024-M07': 1.78,
      '2024-M08': 1.92,
      '2024-M09': 2.15,
      '2024-M10': 2.34,
      '2024-M11': 2.56,
      '2024-M12': 2.78,
    },
  },
  {
    code: '1.04',
    nameUz: 'Xizmatlar',
    nameRu: 'Услуги',
    nameEn: 'Services',
    monthlyData: {
      '2024-M01': 0.68,
      '2024-M02': 0.89,
      '2024-M03': 1.12,
      '2024-M04': 1.34,
      '2024-M05': 1.56,
      '2024-M06': 1.78,
      '2024-M07': 1.95,
      '2024-M08': 2.12,
      '2024-M09': 2.34,
      '2024-M10': 2.56,
      '2024-M11': 2.78,
      '2024-M12': 2.95,
    },
  },
  {
    code: '1.02.01',
    nameUz: 'Non va don mahsulotlari',
    nameRu: 'Хлеб и зерновые продукты',
    nameEn: 'Bread and Cereals',
    monthlyData: {
      '2024-M01': 0.95,
      '2024-M02': 1.24,
      '2024-M03': 1.52,
      '2024-M04': 1.78,
      '2024-M05': 2.05,
      '2024-M06': 2.34,
      '2024-M07': 2.58,
      '2024-M08': 2.84,
      '2024-M09': 3.12,
      '2024-M10': 3.38,
      '2024-M11': 3.65,
      '2024-M12': 3.92,
    },
  },
  {
    code: '1.02.02',
    nameUz: "Go'sht",
    nameRu: 'Мясо',
    nameEn: 'Meat',
    monthlyData: {
      '2024-M01': 1.45,
      '2024-M02': 1.82,
      '2024-M03': 2.18,
      '2024-M04': 2.54,
      '2024-M05': 2.89,
      '2024-M06': 3.24,
      '2024-M07': 3.58,
      '2024-M08': 3.92,
      '2024-M09': 4.28,
      '2024-M10': 4.62,
      '2024-M11': 4.96,
      '2024-M12': 5.32,
    },
  },
  {
    code: '1.02.03',
    nameUz: 'Baliq',
    nameRu: 'Рыба',
    nameEn: 'Fish',
    monthlyData: {
      '2024-M01': 1.12,
      '2024-M02': 1.45,
      '2024-M03': 1.78,
      '2024-M04': 2.08,
      '2024-M05': 2.38,
      '2024-M06': 2.68,
      '2024-M07': 2.95,
      '2024-M08': 3.24,
      '2024-M09': 3.52,
      '2024-M10': 3.82,
      '2024-M11': 4.12,
      '2024-M12': 4.42,
    },
  },
  {
    code: '1.03.01',
    nameUz: 'Kiyim',
    nameRu: 'Одежда',
    nameEn: 'Clothing',
    monthlyData: {
      '2024-M01': 0.42,
      '2024-M02': 0.65,
      '2024-M03': 0.85,
      '2024-M04': 1.08,
      '2024-M05': 1.25,
      '2024-M06': 1.48,
      '2024-M07': 1.68,
      '2024-M08': 1.85,
      '2024-M09': 2.08,
      '2024-M10': 2.28,
      '2024-M11': 2.48,
      '2024-M12': 2.68,
    },
  },
  {
    code: '1.03.02',
    nameUz: 'Oyoq kiyim',
    nameRu: 'Обувь',
    nameEn: 'Footwear',
    monthlyData: {
      '2024-M01': 0.58,
      '2024-M02': 0.82,
      '2024-M03': 1.05,
      '2024-M04': 1.28,
      '2024-M05': 1.48,
      '2024-M06': 1.72,
      '2024-M07': 1.92,
      '2024-M08': 2.12,
      '2024-M09': 2.35,
      '2024-M10': 2.55,
      '2024-M11': 2.78,
      '2024-M12': 2.98,
    },
  },
  {
    code: '1.04.01',
    nameUz: 'Transport xizmatlari',
    nameRu: 'Транспортные услуги',
    nameEn: 'Transport Services',
    monthlyData: {
      '2024-M01': 0.72,
      '2024-M02': 0.95,
      '2024-M03': 1.18,
      '2024-M04': 1.42,
      '2024-M05': 1.65,
      '2024-M06': 1.88,
      '2024-M07': 2.08,
      '2024-M08': 2.28,
      '2024-M09': 2.52,
      '2024-M10': 2.72,
      '2024-M11': 2.95,
      '2024-M12': 3.15,
    },
  },
  {
    code: '1.04.02',
    nameUz: 'Aloqa xizmatlari',
    nameRu: 'Услуги связи',
    nameEn: 'Communication Services',
    monthlyData: {
      '2024-M01': 0.35,
      '2024-M02': 0.52,
      '2024-M03': 0.68,
      '2024-M04': 0.85,
      '2024-M05': 0.98,
      '2024-M06': 1.15,
      '2024-M07': 1.32,
      '2024-M08': 1.48,
      '2024-M09': 1.65,
      '2024-M10': 1.82,
      '2024-M11': 1.98,
      '2024-M12': 2.15,
    },
  },
];

export const getLastUpdateDate = () => {
  return '2025-01-27 14:30';
};

export const getAvailableMonths = (): string[] => {
  const months: string[] = [];
  for (let i = 1; i <= 12; i++) {
    months.push(`2024-M${String(i).padStart(2, '0')}`);
  }
  return months;
};

export const calculateCumulative = (
  data: CPIData,
  startMonth: string,
  endMonth: string
): number => {
  const months = getAvailableMonths();
  const startIdx = months.indexOf(startMonth);
  const endIdx = months.indexOf(endMonth);
  
  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) return 0;
  
  let cumulative = 0;
  for (let i = startIdx; i <= endIdx; i++) {
    cumulative += data.monthlyData[months[i]] || 0;
  }
  
  return cumulative;
};

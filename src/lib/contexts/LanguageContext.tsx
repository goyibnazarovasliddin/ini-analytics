import React, { createContext, useContext, useState } from 'react';

export type Language = 'uz' | 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  uz: {
    // Header
    'header.title': 'INI Analytics',
    'header.subtitle': "O'zbekiston inflyatsiya monitoringi",
    'header.export': 'Eksport',

    // Sidebar
    'sidebar.dashboard': 'Boshqaruv paneli',
    'sidebar.methodology': 'Metodologiya',
    'sidebar.lastUpdate': 'Oxirgi yangilanish',
    'sidebar.refresh': 'Yangilash',
    'sidebar.uploadHistory': 'Fayl yuklash',
    'sidebar.refreshConfirmTitle': 'Ma\'lumotlarni yangilash?',
    'sidebar.refreshConfirmBody': 'Bu amal ma\'lumotlarni qayta yuklab olib bazani yangilaydi. Davom etamizmi?',
    'sidebar.refreshConfirm': 'Tasdiqlash',
    'sidebar.refreshCancel': 'Bekor qilish',
    'sidebar.refreshing': 'Ma\'lumotlar yangilanmoqda…',
    'sidebar.refreshSuccess': 'Yangilandi',
    'sidebar.refreshError': 'Yangilashda xatolik. Qayta urinib ko\'ring.',
    'sidebar.uploadTitle': 'Fayl yuklash',
    'sidebar.enterPassword': 'Admin parolini kiriting',
    'sidebar.selectFile': 'Excel faylni tanlang',
    'sidebar.uploadProcess': 'Yuklash',
    'sidebar.attemptsLeft': 'Qolgan urinishlar:',
    'sidebar.tooManyAttempts': 'Urinishlar soni oshib ketdi. 24 soatdan keyin qayta urinib ko\'ring.',
    'sidebar.invalidPassword': 'Noto\'g\'ri parol.',
    'sidebar.fileTooLarge': 'Fayl hajmi juda katta (Maks 50MB).',
    'sidebar.selectFileError': 'Iltimos, fayl tanlang.',
    'sidebar.uploadSuccess': 'Fayl muvaffaqiyatli yuklandi.',
    'sidebar.uploadFailed': 'Yuklashda xatolik yuz berdi:',
    'sidebar.verify': 'Tekshirish',
    'sidebar.back': 'Orqaga',
    'sidebar.clickToSelect': 'Fayl tanlash uchun bosing',

    // Filter Panel
    'filter.title': 'Filtrlar',
    'filter.classifiers': 'Tovar va xizmatlar (klassifikatorlar)',
    'filter.classifierSearchPlaceholder': 'Klassifikator bo\'yicha qidirish...',
    'filter.itemsSelected': 'ta element tanlandi',
    'filter.selectAll': 'Barchasini tanlash',
    'filter.clear': 'Tozalash',
    'filter.noResults': 'Hech narsa topilmadi',
    'filter.startDate': 'Boshlanish sanasi',
    'filter.endDate': 'Tugash sanasi',
    'filter.dateRange': 'Sana oralig\'i',
    'filter.indicatorType': 'Ko\'rsatkich turi',
    'filter.percentageOnly': 'Faqat foiz o\'zgarishlarini ko\'rsatish',
    'filter.apply': 'Qo\'llash',
    'filter.reset': 'Tiklash',
    'filter.helperText': 'Grafik va jadvallarda faqat foiz o\'zgarishlar aks ettiriladi.',

    // KPIs
    'kpi.total': 'Yig\'ma indeks',
    'kpi.food': 'Oziq-ovqat mahsulotlari',
    'kpi.nonFood': 'Nooziq-ovqat mahsulotlari',
    'kpi.services': 'Xizmatlar',
    'kpi.cumulativeChange': 'Kumulyativ o\'zgarish',

    // Chart
    'chart.title': 'Inflyatsiya trendi',
    'chart.line': 'Chiziq',
    'chart.bar': 'Ustun',
    'chart.emptyState': 'Ma\'lumotni ko\'rish uchun filtrlarni tanlang',

    // Table
    'table.title': 'Jadval',
    'table.code': 'Kod',
    'table.classifier': 'Klassifikator',
    'table.showingLabel': 'Ko\'rsatilmoqda:',
    'table.from': 'dan',
    'table.to': 'gacha',
    'table.totalLabel': 'Jami:',
    'table.totalCount': 'ta',
    'table.rows': 'qator',
    'table.search': 'Qidirish...',
    'table.searchPlaceholder': 'Kod yoki nom bo\'yicha qidiring...',

    // Methodology
    'methodology.title': 'Hisoblash metodologiyasi',
    'methodology.authority': 'O\'zbekiston Respublikasi Prezidenti huzuridagi Statistika agentligi. Hisob-kitoblar rasmiy oylik iste\'mol narxlari indeksi (INI) ma\'lumotlariga asoslangan.',
    'methodology.mom': 'MoM — Oylik o\'zgarish',
    'methodology.momDesc': 'Month-over-Month (Oylik o\'zgarish). MoM joriy oyning narx darajasini bevosita undan oldingi oy bilan taqqoslaydi.',
    'methodology.momFormula': 'MoM (%) = [ (Index_t / Index_{t-1}) - 1 ] × 100',
    'methodology.momLegend': 'Index_t — joriy oy indeksi, Index_{t-1} — o\'tgan oy indeksi.',
    'methodology.yoy': 'YoY — Yillik o\'zgarish',
    'methodology.yoyDesc': 'Year-over-Year (Yillik o\'zgarish). Narxlarni o\'tgan yilning mos oyiga nisbatan taqqoslaydi. Inflyatsiya trendining barqarorligini baholashda asosiy ko\'rsatkich hisoblanadi.',
    'methodology.yoyFormula': 'YoY (%) = [ ∏_{i=t-11}^{t} (Index_i / 100) - 1 ] × 100',
    'methodology.yoyLegend': '∏ (Index_i / 100) — oxirgi 12 oylik indekslar ko\'paytmasi.',
    'methodology.cumulative': 'Kumulyativ — Jamlanuvchi o\'zgarish',
    'methodology.cumulativeDesc': 'Kumulyativ o\'zgarish. Tanlangan vaqt oralig\'idagi umumiy inflyatsiya effektini bildiradi. O\'rta va uzoq muddatli tahlillar uchun qo\'llaniladi.',
    'methodology.cumulativeFormula': 'Cumulative (%) = [ ∏ (Index_i / 100) - 1 ] × 100',
    'methodology.cumulativeLegend': '∏ (Index_i / 100) — tanlangan davrdagi barcha oylik ko\'rsatkichlar ko\'paytmasi.',
    'methodology.requirements': 'Ma\'lumotlarga talablar',
    'methodology.requirementsDesc': 'Hisob-kitoblar uchun oylik INI ko\'rsatkichlari, tovar va xizmatlar klassifikatsiyasi va uzluksiz vaqtli qatorlar talab etiladi. Barcha klassifikatorlar uchun yagona metodologiya qo\'llaniladi. Bo\'sh qolgan davrlar va o\'nlik sonlarni normallashtirish avtomatik amalga oshiriladi.',
    'methodology.processing': 'Tizim va qayta ishlash',
    'methodology.processingDesc': 'Ma\'lumotlar strukturalangan relyatsion bazada saqlanadi. Yangilash jarayoni (Refresh) manba faylni qayta yuklaydi va bazani yangilaydi. Barcha tahliliy hisob-kitoblar foydalanuvchi filtrlari asosida dinamik tarzda bajariladi.',
    'methodology.dataSource': 'Ma\'lumot manbai',
    'methodology.dataSourceText': 'O\'zbekiston Respublikasi Prezidenti huzuridagi Statistika agentligi',
    'methodology.fileName': 'Fayl nomi: sdmx_data_4585.xlsx (Oylik chastota)',
    'methodology.finalNoteTitle': 'Iste\'mol narxlari indeksi tahlili',
    'methodology.finalNoteContent': 'Iste\'mol narxlari indeksi (INI) mamlakatdagi inflyatsiya darajasini belgilovchi eng muhim iqtisodiy barometrdir. Ushbu platformada qo\'llanilgan metodologiya xalqaro standartlarga (Xalqaro Valyuta Jamg\'armasi va Xalqaro Mehnat Tashkiloti tavsiyalari) to\'liq mos keladi. Ma\'lumotlarning shaffofligi va qayta ishlanishi iqtisodiy tahlillarning aniqligini ta\'minlaydi va ijtimoiy-iqtisodiy qarorlar qabul qilishda ishonchli asos bo\'lib xizmat qiladi.',

    // Indicator Types
    'indicator.mom': 'MoM',
    'indicator.yoy': 'YoY',
    'indicator.cumulative': 'Kumulyativ',

    // Classifiers
    'classifier.1': 'Yig\'ma indeks',
    'classifier.1.02': 'Oziq-ovqat mahsulotlari',
    'classifier.1.03': 'Nooziq-ovqat mahsulotlari',
    'classifier.1.04': 'Xizmatlar',
    'refresh.fetchingHeadline': 'Ma\'lumotlar yuklanmoqda',
    'refresh.finishing': 'Yakunlanmoqda...',
    'refresh.fetchingSub': 'Bazadagi o\'zgarishlar interfeysga qo\'llanilmoqda.',
    'refresh.refreshingSub': 'Iltimos, kuting. Ma\'lumotlar bazasi yangilanmoqda...',
    'refresh.warning': 'Bu jarayon davomida sahifani yopmang yoki yangilamang.',
  },
  ru: {
    // Header
    'header.title': 'INI Analytics',
    'header.subtitle': 'Мониторинг инфляции Узбекистана',
    'header.export': 'Экспорт',

    // Sidebar
    'sidebar.dashboard': 'Панель управления',
    'sidebar.methodology': 'Методология',
    'sidebar.lastUpdate': 'Последнее обновление',
    'sidebar.refresh': 'Обновить',
    'sidebar.uploadHistory': 'Загрузить файл',
    'sidebar.refreshConfirmTitle': 'Обновить данные?',
    'sidebar.refreshConfirmBody': 'Это действие повторно загрузит данные и обновит базу. Продолжить?',
    'sidebar.refreshConfirm': 'Подтвердить',
    'sidebar.refreshCancel': 'Отмена',
    'sidebar.refreshing': 'Обновление данных…',
    'sidebar.refreshSuccess': 'Обновлено',
    'sidebar.refreshError': 'Ошибка обновления. Попробуйте снова.',
    'sidebar.uploadTitle': 'Загрузка файла',
    'sidebar.enterPassword': 'Введите пароль администратора',
    'sidebar.selectFile': 'Выберите файл Excel',
    'sidebar.uploadProcess': 'Загрузить',
    'sidebar.attemptsLeft': 'Осталось попыток:',
    'sidebar.tooManyAttempts': 'Слишком много попыток. Попробуйте через 24 часа.',
    'sidebar.invalidPassword': 'Неверный пароль.',
    'sidebar.fileTooLarge': 'Файл слишком большой (Макс 50MB).',
    'sidebar.selectFileError': 'Пожалуйста, выберите файл.',
    'sidebar.uploadSuccess': 'Файл успешно загружен.',
    'sidebar.uploadFailed': 'Ошибка загрузки:',
    'sidebar.verify': 'Проверить',
    'sidebar.back': 'Назад',
    'sidebar.clickToSelect': 'Нажмите для выбора файла',

    // Filter Panel
    'filter.title': 'Фильтры',
    'filter.classifiers': 'Товары и услуги (классификаторы)',
    'filter.classifierSearchPlaceholder': 'Поиск по классификатору...',
    'filter.itemsSelected': 'выбрано элементов',
    'filter.selectAll': 'Выбрать все',
    'filter.clear': 'Очистить',
    'filter.noResults': 'Ничего не найдено',
    'filter.startDate': 'Дата начала',
    'filter.endDate': 'Дата окончания',
    'filter.dateRange': 'Диапазон дат',
    'filter.indicatorType': 'Тип показателя',
    'filter.percentageOnly': 'Показывать только процентные изменения',
    'filter.apply': 'Применить',
    'filter.reset': 'Сбросить',
    'filter.helperText': 'На графике и в таблице отражаются только процентные изменения.',

    // KPIs
    'kpi.total': 'Сводный индекс',
    'kpi.food': 'Продовольственные товары',
    'kpi.nonFood': 'Непродовольственные товары',
    'kpi.services': 'Услуги',
    'kpi.cumulativeChange': 'Кумулятивное изменение',

    // Chart
    'chart.title': 'Тренд инфляции',
    'chart.line': 'Линия',
    'chart.bar': 'Столбец',
    'chart.emptyState': 'Выберите фильтры для просмотра данных',

    // Table
    'table.title': 'Таблица',
    'table.code': 'Код',
    'table.classifier': 'Классификатор',
    'table.showingLabel': 'Показано: с',
    'table.from': 'по',
    'table.to': '',
    'table.totalLabel': 'Всего:',
    'table.totalCount': '',
    'table.rows': 'строк',
    'table.search': 'Поиск...',
    'table.searchPlaceholder': 'Поиск по коду или названию...',

    // Methodology
    'methodology.title': 'Методология расчета',
    'methodology.authority': 'Агентство статистики при Президенте Республики Узбекистан. Расчеты основаны на официальных ежемесячных данных индекса потребительских цен (ИПЦ).',
    'methodology.mom': 'MoM — Месячное изменение',
    'methodology.momDesc': 'Month-over-Month (Месячное изменение). MoM сравнивает уровень цен текущего месяца непосредственно с предыдущим месяцем.',
    'methodology.momFormula': 'MoM (%) = [ (Index_t / Index_{t-1}) - 1 ] × 100',
    'methodology.momLegend': 'Index_t — индекс текущего месяца, Index_{t-1} — индекс предыдущего месяца.',
    'methodology.yoy': 'YoY — Годовое изменение',
    'methodology.yoyDesc': 'Year-over-Year (Годовое изменение). Сравнивает цены с соответствующим месяцем предыдущего года. Является ключевым индикатором для оценки стабильности инфляционного тренда.',
    'methodology.yoyFormula': 'YoY (%) = [ ∏_{i=t-11}^{t} (Index_i / 100) - 1 ] × 100',
    'methodology.yoyLegend': '∏ (Index_i / 100) — произведение индексов за последние 12 месяцев.',
    'methodology.cumulative': 'Cumulative — Накопительное изменение',
    'methodology.cumulativeDesc': 'Накопительное изменение. Отражает общий эффект инфляции за выбранный период времени. Используется для средне- и долгосрочного анализа.',
    'methodology.cumulativeFormula': 'Cumulative (%) = [ ∏ (Index_i / 100) - 1 ] × 100',
    'methodology.cumulativeLegend': '∏ (Index_i / 100) — произведение всех месячных коэффициентов за выбранный период.',
    'methodology.requirements': 'Требования к данным',
    'methodology.requirementsDesc': 'Для расчетов требуются ежемесячные значения ИПЦ, классификация товаров и услуг и непрерывные временные ряды. Для всех классификаторов применяется единая методология. Нормализация пропущенных периодов и десятичных знаков выполняется автоматически.',
    'methodology.processing': 'Система и обработка',
    'methodology.processingDesc': 'Данные хранятся в структурированной реляционной базе данных. Процесс обновления (Refresh) повторно загружает исходный файл и обновляет БД. Все аналитические расчеты выполняются динамически на основе фильтров пользователя.',
    'methodology.dataSource': 'Источник данных',
    'methodology.dataSourceText': 'Агентство статистики при Президенте Республики Узбекистан',
    'methodology.fileName': 'Имя файла: sdmx_data_4585.xlsx (Ежемесячная частота)',
    'methodology.finalNoteTitle': 'Анализ индекса потребительских цен',
    'methodology.finalNoteContent': 'Индекс потребительских цен (ИПЦ) является важнейшим экономическим барометром, определяющим уровень инфляции в стране. Методология, используемая на данной платформе, полностью соответствует международным стандартам (рекомендации Международного валютного фонда и Международной организации труда). Прозрачность и воспроизводимость данных обеспечивают точность экономического анализа и служат надежной основой для принятия социально-экономических решений.',

    // Indicator Types
    'indicator.mom': 'MoM',
    'indicator.yoy': 'YoY',
    'indicator.cumulative': 'Кумулятивное',

    // Classifiers
    'classifier.1': 'Сводный индекс',
    'classifier.1.02': 'Продовольственные товары',
    'classifier.1.03': 'Непродовольственные товары',
    'classifier.1.04': 'Услуги',
    'refresh.fetchingHeadline': 'Загрузка данных',
    'refresh.finishing': 'Завершение...',
    'refresh.fetchingSub': 'Изменения применяются к интерфейсу.',
    'refresh.refreshingSub': 'Пожалуйста, подождите. База данных обновляется...',
    'refresh.warning': 'Не закрывайте и не перезагружайте страницу во время этого процесса.',
  },
  en: {
    // Header
    'header.title': 'INI Analytics',
    'header.subtitle': 'Uzbekistan Inflation Monitoring',
    'header.export': 'Export',

    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.methodology': 'Methodology',
    'sidebar.lastUpdate': 'Last update',
    'sidebar.refresh': 'Refresh',
    'sidebar.uploadHistory': 'Upload History',
    'sidebar.refreshConfirmTitle': 'Refresh data?',
    'sidebar.refreshConfirmBody': 'This action will re-download data and update the database. Continue?',
    'sidebar.refreshConfirm': 'Confirm',
    'sidebar.refreshCancel': 'Cancel',
    'sidebar.refreshing': 'Refreshing data…',
    'sidebar.refreshSuccess': 'Refreshed',
    'sidebar.refreshError': 'Refresh error. Please try again.',
    'sidebar.uploadTitle': 'Upload Historical Data',
    'sidebar.enterPassword': 'Enter Admin Password',
    'sidebar.selectFile': 'Select Excel File',
    'sidebar.uploadProcess': 'Upload & Process',
    'sidebar.attemptsLeft': 'Attempts left:',
    'sidebar.tooManyAttempts': 'Too many attempts. Try again in 24h.',
    'sidebar.invalidPassword': 'Invalid password.',
    'sidebar.fileTooLarge': 'File is too large (Max 50MB).',
    'sidebar.selectFileError': 'Please select a file.',
    'sidebar.uploadSuccess': 'Historical data successfully imported.',
    'sidebar.uploadFailed': 'Import failed:',
    'sidebar.verify': 'Verify',
    'sidebar.back': 'Back',
    'sidebar.clickToSelect': 'Click to select file',

    // Filter Panel
    'filter.title': 'Filters',
    'filter.classifiers': 'Goods and Services (Classifiers)',
    'filter.classifierSearchPlaceholder': 'Search by classifier...',
    'filter.itemsSelected': 'items selected',
    'filter.selectAll': 'Select all',
    'filter.clear': 'Clear',
    'filter.noResults': 'No classifier found',
    'filter.startDate': 'Start Date',
    'filter.endDate': 'End Date',
    'filter.dateRange': 'Date Range',
    'filter.indicatorType': 'Indicator Type',
    'filter.percentageOnly': 'Show percentage changes only',
    'filter.apply': 'Apply',
    'filter.reset': 'Reset',
    'filter.helperText': 'Charts and tables display only percentage changes.',

    // KPIs
    'kpi.total': 'Total Index',
    'kpi.food': 'Food Products',
    'kpi.nonFood': 'Non-food Products',
    'kpi.services': 'Services',
    'kpi.cumulativeChange': 'Cumulative Change',

    // Chart
    'chart.title': 'Inflation Trend',
    'chart.line': 'Line',
    'chart.bar': 'Bar',
    'chart.emptyState': 'Select filters to view data',

    // Table
    'table.title': 'Table',
    'table.code': 'Code',
    'table.classifier': 'Classifier',
    'table.showingLabel': 'Showing:',
    'table.from': 'to',
    'table.to': '',
    'table.totalLabel': 'Total:',
    'table.totalCount': '',
    'table.rows': 'rows',
    'table.search': 'Search...',
    'table.searchPlaceholder': 'Search by code or name...',

    // Methodology
    'methodology.title': 'Calculation Methodology',
    'methodology.authority': 'Statistics Agency under the President of the Republic of Uzbekistan. Calculations are based on official monthly Consumer Price Index (CPI) data.',
    'methodology.mom': 'MoM — Month-over-Month',
    'methodology.momDesc': 'Month-over-Month (MoM) compares the price level of the current month directly with the previous month.',
    'methodology.momFormula': 'MoM (%) = [ (Index_t / Index_{t-1}) - 1 ] × 100',
    'methodology.momLegend': 'Index_t = current month index, Index_{t-1} = previous month index.',
    'methodology.yoy': 'YoY — Year-over-Year',
    'methodology.yoyDesc': 'Year-over-Year (YoY) compares prices with the corresponding month of the previous year. It is a key indicator for assessing the stability of the inflation trend.',
    'methodology.yoyFormula': 'YoY (%) = [ ∏_{i=t-11}^{t} (Index_i / 100) - 1 ] × 100',
    'methodology.yoyLegend': '∏ (Index_i / 100) — product of the indices for the last 12 months.',
    'methodology.cumulative': 'Cumulative — Accumulated Change',
    'methodology.cumulativeDesc': 'Accumulated change reflects the total effect of inflation over a selected period of time. Used for medium- and long-term analysis.',
    'methodology.cumulativeFormula': 'Cumulative (%) = [ ∏ (Index_i / 100) - 1 ] × 100',
    'methodology.cumulativeLegend': '∏ (Index_i / 100) — product of all monthly index factors over the selected period.',
    'methodology.requirements': 'Data Requirements',
    'methodology.requirementsDesc': 'Calculations require monthly CPI index values, classification of goods and services, and continuous time series. A single methodology is applied to all classifiers. Normalization of missing periods and decimal places is performed automatically.',
    'methodology.processing': 'System & Processing',
    'methodology.processingDesc': 'Data is stored in a structured relational database. The refresh process re-downloads the source file and updates the DB. All analytical calculations are performed dynamically based on user-selected filters.',
    'methodology.dataSource': 'Data Source',
    'methodology.dataSourceText': 'Statistics Agency under the President of the Republic of Uzbekistan',
    'methodology.fileName': 'File name: sdmx_data_4585.xlsx (Monthly frequency)',
    'methodology.finalNoteTitle': 'Consumer Price Index Analysis',
    'methodology.finalNoteContent': 'The Consumer Price Index (CPI) is a critical economic barometer as it measures the inflation rate in the country. The methodology used on this platform fully complies with international standards (recommendations of the International Monetary Fund and the International Labour Organization). Data transparency and reproducibility ensure the accuracy of economic analysis and offer a reliable basis for socio-economic decision-making.',

    // Indicator Types
    'indicator.mom': 'MoM',
    'indicator.yoy': 'YoY',
    'indicator.cumulative': 'Cumulative',

    // Classifiers
    'classifier.1': 'Total Index',
    'classifier.1.02': 'Food Products',
    'classifier.1.03': 'Non-food Products',
    'classifier.1.04': 'Services',
    'refresh.fetchingHeadline': 'Fetching Data',
    'refresh.finishing': 'Finishing...',
    'refresh.fetchingSub': 'Applying changes to the interface.',
    'refresh.refreshingSub': 'Please wait. The database is being updated...',
    'refresh.warning': 'Do not close or refresh the page during this process.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('uz');

  const t = (key: string): string => {
    const value = translations[language][key];
    return value !== undefined ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

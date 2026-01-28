import { Download } from 'lucide-react';
import { useTheme } from '../lib/contexts/ThemeContext';
import { useLanguage, Language } from '../lib/contexts/LanguageContext';
import { Button } from './ui/button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export function Header() {
  const { language, setLanguage, t } = useLanguage();

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting data...');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#0F1A2B] px-6 lg:px-8 py-4">
      <div className="flex items-center justify-end h-[41px]">

        {/* Right: Controls */}
        <div className="flex items-center gap-4">
          {/* Language toggle */}
          <ToggleGroup
            type="single"
            value={language}
            onValueChange={(value) => {
              if (value) setLanguage(value as Language);
            }}
            className="border border-border rounded-lg"
          >
            <ToggleGroupItem
              value="uz"
              className="px-3 py-1.5 text-sm data-[state=on]:bg-primary/10 data-[state=on]:text-primary font-medium transition-colors"
            >
              UZ
            </ToggleGroupItem>
            <ToggleGroupItem
              value="ru"
              className="px-3 py-1.5 text-sm data-[state=on]:bg-primary/10 data-[state=on]:text-primary font-medium transition-colors"
            >
              RU
            </ToggleGroupItem>
            <ToggleGroupItem
              value="en"
              className="px-3 py-1.5 text-sm data-[state=on]:bg-primary/10 data-[state=on]:text-primary font-medium transition-colors"
            >
              EN
            </ToggleGroupItem>
          </ToggleGroup>




        </div>
      </div>
    </header>
  );
}

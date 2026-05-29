import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const next = i18n.language === 'th' ? 'en' : 'th';

  function toggle() {
    i18n.changeLanguage(next);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label="Toggle language"
      className="h-9 gap-1 px-2 font-bold uppercase"
    >
      <Languages className="h-4 w-4" />
      {i18n.language === 'th' ? 'TH' : 'EN'}
    </Button>
  );
}

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('LanguageSelector mounted with language:', i18n.language);
      console.log('localStorage i18nextLng:', localStorage.getItem('i18nextLng'));
    }
  }, [i18n.language]);

  const languages = [
    { code: 'en', name: t('language.english') },
    { code: 'es', name: t('language.spanish') },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Manually save to localStorage before changing language
      localStorage.setItem('i18nextLng', languageCode);

      await i18n.changeLanguage(languageCode);

      if (process.env.NODE_ENV === 'development') {
        console.log('Language changed to:', languageCode);
        console.log('Current i18n language:', i18n.language);
        console.log('localStorage i18nextLng:', localStorage.getItem('i18nextLng'));
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              i18n.language === language.code ? 'bg-accent' : ''
            }`}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
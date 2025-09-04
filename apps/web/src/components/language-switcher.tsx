"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@portalis/ui";
import { locales, type Locale } from "../i18n";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  const currentLocale = pathname.split("/")[1] as Locale;

  return (
    <div className="flex space-x-2">
      {locales.map((locale) => (
        <Button
          key={locale}
          variant={currentLocale === locale ? "default" : "ghost"}
          size="sm"
          onClick={() => switchLanguage(locale)}
        >
          {locale.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}

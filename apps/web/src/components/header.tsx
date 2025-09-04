"use client";

import Link from "next/link";
// import { useTranslations } from "next-intl";
import { Button } from "@portalis/ui";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  // const t = useTranslations("navigation");

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Portalis
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/countries" className="hover:text-primary">
            Countries
          </Link>
          <Link href="/compare" className="hover:text-primary">
            Compare
          </Link>
          <Link href="/wizard" className="hover:text-primary">
            Wizard
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Button variant="outline">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
}

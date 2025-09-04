import { notFound } from 'next/navigation';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { AuthProvider } from '../../lib/auth';
import { Providers } from './providers';

const locales = ['en', 'de'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return (
    <AuthProvider>
      <Providers>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </Providers>
    </AuthProvider>
  );
}

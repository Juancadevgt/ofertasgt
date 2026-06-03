import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ofertas GT — Las mejores ofertas de supermercados en Guatemala',
  description:
    'Compara precios de la canasta básica entre Walmart, Maxi Despensa, La Torre y Paiz. Historial de precios y detector de oferta real.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <header className="bg-primary-700 text-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              <span>🛒</span>
              <span>Ofertas GT</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">Ofertas</Link>
              <Link href="/buscar" className="hover:underline">Buscar</Link>
              <Link href="/alertas" className="hover:underline">Alertas</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
        </main>

        <footer className="border-t bg-white py-4 text-center text-xs text-slate-500">
          Hecho en Guatemala 🇬🇹 para ayudar a la canasta básica.
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bright Light Solutions - Kvalitetssimulering",
  description: "Interaktiv simulering för undervisning i kvalitetsstyrning och projektledning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <header className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h1 className="text-xl font-bold">Bright Light Solutions AB</h1>
                  <p className="text-sm text-yellow-100">Kvalitets- och Projektledningssimulering</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

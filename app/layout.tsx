import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bright Light Solutions - Kvalitetssimulering",
  description: "Interaktiv företagssimulering för konsultutbildning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Proxy - Best Residential IP Proxy Service Provider",
  description: "Best residential ip proxy service provider to help companies get more profit. Real Proxy provides the most stable and high-speed residential proxies.",
};

import StyledJsxRegistry from "./registry";
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Toaster position="top-right" />
        <StyledJsxRegistry>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}


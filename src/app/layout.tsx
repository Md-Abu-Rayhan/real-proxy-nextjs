import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Real Proxy - Best Residential IP Proxy Service Provider",
  description: "Best residential ip proxy service provider to help companies get more profit. Real Proxy provides the most stable and high-speed residential proxies.",
};

import StyledJsxRegistry from "./registry";
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/context/LanguageContext';
import { ContactModal } from '@/components/ui/ContactModal';

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
            <ContactModal />
          </LanguageProvider>
        </StyledJsxRegistry>
        <Script id="crisp-script" strategy="afterInteractive">
          {`window.$crisp=[];window.CRISP_WEBSITE_ID="d47ade8c-f795-4cd9-be9a-366b5eaa177c";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}
        </Script>
      </body>
    </html>
  );
}


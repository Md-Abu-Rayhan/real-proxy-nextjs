import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "922S5Proxy - Best Residential IP Proxy Service Provider",
  description: "Best residential ip proxy service provider to help companies get more profit. 922S5Proxy provides the most stable and high-speed residential proxies.",
};

import StyledJsxRegistry from "./registry";
import { Toaster } from 'react-hot-toast';

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
          {children}
        </StyledJsxRegistry>
      </body>
    </html>
  );
}


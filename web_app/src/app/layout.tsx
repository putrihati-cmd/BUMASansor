import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "BUMAS Ansor - POS & Distribution",
  description: "Badan Usaha Milik Ansor - Platform Distribusi & POS Retail",
  manifest: "/manifest.json",
  themeColor: "#1e5d48",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 flex justify-center min-h-screen">
        <div className="mobile-container w-full">
          <QueryProvider>
            {children}
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}

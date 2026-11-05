import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Invoice Maker", description: "Create a professional invoice" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

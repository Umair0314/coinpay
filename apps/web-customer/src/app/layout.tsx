import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "CoinPay", description: "Manual PKR deposits and withdrawals for game coins." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning>{children}</body></html>;
}

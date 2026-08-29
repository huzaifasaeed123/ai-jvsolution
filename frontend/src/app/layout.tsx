import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";
import { getLocale } from "@/i18n/server";
import { directionOf } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Display face. Carries headlines and headline figures only — everything
 * operational stays in the sans. A transitional serif gives the institutional
 * register the subject calls for without dressing up the working UI.
 */
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${config.brandName} — Land, Infrastructure & Development Partners`,
    template: `%s · ${config.brandName}`,
  },
  description:
    "Global AI platform connecting opportunity owners with capital and delivery partners for JV, PPP, concession and infrastructure deals.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "@/lib/i18n/context";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export const metadata: Metadata = {
  title: {
    default: "SangoStore – La marketplace de la diaspora centrafricaine",
    template: "%s | SangoStore",
  },
  description:
    "Commandez depuis la diaspora, recevez à Bangui. Produits authentiques depuis la France, le Sénégal, le Cameroun et plus encore. SangoStore by Legos.",
  keywords: ["sangomarket", "marketplace", "diaspora", "centrafrique", "bangui", "e-commerce", "afrique"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "SangoStore",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      {/* Google Analytics 4 — active uniquement si NEXT_PUBLIC_GA4_ID est défini */}
      {GA4_ID && (
        <head>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}', { send_page_view: false });
          `}</Script>
        </head>
      )}
      <body className={poppins.variable}>
        <AnalyticsTracker />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#f97316", secondary: "#fff" },
            },
          }}
        />
        <I18nProvider>
          <CurrencyProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </CartProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

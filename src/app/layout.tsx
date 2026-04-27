import "./globals.css";
import { Providers } from "./providers";
import AppNavbar from "@/components/Navbar";
import AppFooter from "@/components/Footer";
import { Kanit } from "next/font/google";
import type { Metadata } from "next";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "SnapBuild — PC Builder",
  description: "แพลตฟอร์มจัดสเปกคอมพิวเตอร์พร้อมระบบ Benchmark อัจฉริยะ",
  icons: {
    icon: [
      { url: "/favicon/favicon-16.png", sizes: "16x16",  type: "image/png" },
      { url: "/favicon/favicon-32.png", sizes: "32x32",  type: "image/png" },
      { url: "/favicon/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/favicon/favicon-512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${kanit.variable}`}>
      <body className={`antialiased bg-black text-white min-h-screen font-sans flex flex-col`}>
        <Providers>
          <AppNavbar /> 
          <main className="flex-1"> 
            {children} 
          </main>
          <AppFooter />
        </Providers>
      </body>
    </html>
  );
}
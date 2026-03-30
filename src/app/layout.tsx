import "./globals.css";
import { Providers } from "./providers";
import AppNavbar from "@/components/Navbar";
import AppFooter from "@/components/Footer";
import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-kanit",
});

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
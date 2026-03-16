import "./globals.css";
import { Providers } from "./providers";
import AppNavbar from "@/components/Navbar";
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
    <html lang="en" className="dark">
      <body className={`antialiased bg-black text-white min-h-screen ${kanit.className}`}>
        <Providers>
          <AppNavbar /> 
          {/* 🟢 เพิ่ม className="pt-20" เพื่อเว้นระยะจาก Navbar */}
          <main> 
            {children} 
          </main>
        </Providers>
      </body>
    </html>
  );
}
import "./globals.css";
import { Providers } from "./providers";
import AppNavbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white min-h-screen">
        <Providers>
          <AppNavbar /> 
          {/* 🟢 เพิ่ม className="pt-20" เพื่อเว้นระยะจาก Navbar */}
          <main className="pt-20"> 
            {children} 
          </main>
        </Providers>
      </body>
    </html>
  );
}
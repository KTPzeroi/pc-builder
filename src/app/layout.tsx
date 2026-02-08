import "./globals.css";
import { Providers } from "./providers";
import AppNavbar from "@/components/Navbar"; // ตรวจสอบว่ามีบรรทัดนี้บรรทัดเดียว

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
          <main>
            {children} 
          </main>
        </Providers>
      </body>
    </html>
  );
}
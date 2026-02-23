"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { SessionProvider } from "next-auth/react"; // 🟢 1. เพิ่มการ Import

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // 🟢 2. ครอบ SessionProvider ไว้ชั้นนอกสุด
    <SessionProvider> 
      <HeroUIProvider>
        <ToastProvider 
          placement="top-right"
          toastProps={{
            timeout: 3000,
            classNames: {
              base: "w-full sm:w-[350px] top-0 sm:top-[80px] right-0 sm:right-4 z-[9999]",
              content: "text-sm md:text-base p-4", 
            }
          }}
        />
        {children}
      </HeroUIProvider>
    </SessionProvider>
  );
}
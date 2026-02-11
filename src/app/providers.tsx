"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
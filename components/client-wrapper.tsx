"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <></>; // Prevents hydration mismatch

  return <ThemeProvider attribute="class" defaultTheme="light">{children}</ThemeProvider>;
}

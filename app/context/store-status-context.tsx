"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getStoreStatus } from "@/lib/store";

type StoreStatusContextType = {
  isOnline: boolean;
  refreshStatus: () => Promise<void>;
};

const StoreStatusContext = createContext<StoreStatusContextType | undefined>(
  undefined
);

export function StoreStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);

  const refreshStatus = async () => {
    try {
      const status = await getStoreStatus();
      setIsOnline(status.isOnline);
    } catch (error) {
      console.error("Failed to refresh store status:", error);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        const status = await getStoreStatus();
        if (isMounted) {
          setIsOnline(status.isOnline);
        }
      } catch (error) {
        console.error("Failed to fetch store status:", error);
      }
    };

    fetchData();

    // Set up periodic refresh
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <StoreStatusContext.Provider value={{ isOnline, refreshStatus }}>
      {children}
    </StoreStatusContext.Provider>
  );
}

export function useStoreStatus() {
  const context = useContext(StoreStatusContext);
  if (context === undefined) {
    throw new Error("useStoreStatus must be used within a StoreStatusProvider");
  }
  return context;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

let storeStatusCache: { isOnline: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000 * 5; // 5 minute cache

export async function getStoreStatus(): Promise<{ isOnline: boolean }> {
  // Return cached value if it exists and isn't expired
  if (storeStatusCache && Date.now() - storeStatusCache.timestamp < CACHE_DURATION) {
    return { isOnline: storeStatusCache.isOnline };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/store-status`, {
      cache: 'no-store' // Important for server components
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch store status: ${response.statusText}`);
    }

    const data = await response.json();

    // Update cache
    storeStatusCache = {
      isOnline: data.isOnline,
      timestamp: Date.now()
    };

    return { isOnline: data.isOnline };
  } catch (error) {
    console.error('Failed to fetch store status:', error);
    return { isOnline: true }; // Fallback to online if there's an error
  }
}

export async function setStoreStatus(isOnline: boolean): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/store-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isOnline }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update store status: ${response.statusText}`);
    }

    // Update cache
    storeStatusCache = {
      isOnline,
      timestamp: Date.now()
    };

    const data = await response.json();
    return { success: data.success };
  } catch (error) {
    console.error('Failed to update store status:', error);
    throw error;
  }
}
import { OrderStatus } from "@/types/order";

export async function fetchOrders() {
  const res = await fetch("/api/orders", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch orders");
  }
  return result.orders;
}
export async function fetchOrderById(orderId: string) {
  const res = await fetch(`/api/orders?orderId=${orderId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch order");
  }
  return result.order;
}

export async function updateOrder(orderId: string, status: string, price?: number, addressDetails?: { address: string; city: string; state: string; pincode: string; }) {
  const res = await fetch("/api/orders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status, price, ...addressDetails }),
  });

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to update order");
  }
  return result;
}

export async function createOrder(orderData: any) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) throw new Error("Failed to create order");
    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to create order");
    }

    return result;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const res = await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update order status");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}
// export async function createOrder(orderData: any) {
//   try {
//     const res = await fetch("/api/orders", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(orderData),
//     });

//     if (!res.ok) {
//       const errorResponse = await res.json().catch(() => null);
//       const errorMessage = errorResponse?.error || "Failed to create order";
//       throw new Error(errorMessage);
//     }

//     const result = await res.json();
//     if (!result.orderId) {
//       throw new Error("Invalid server response: orderId missing");
//     }

//     return result.orderId;
//   } catch (error) {
//     console.error("Error in createOrder:", error);
//     throw new Error(error instanceof Error ? error.message : "Failed to create order");
//   }
// }

export async function setOrderPrice(orderId: string, price: number) {
  try {
    const res = await fetch("/api/orders", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, price }),
    });

    if (!res.ok) {
      const errorResponse = await res.json().catch(() => null);
      const errorMessage = errorResponse?.error || "Failed to set order price";
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error("Error setting order price:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to set order price");
  }
}

export async function confirmPayment(
  orderId: string,
  paymentId: string,
  amount: number,
  signature?: string
) {
  try {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paymentId, amount, signature }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to confirm payment");
    }

    return await res.json();
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
}

export async function getUserOrders(phone: string) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch orders");
    }

    return result.orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to fetch orders");
  }
}

// export async function updateOrderStatus(orderId: string, status: string) {
//   try {
//     const res = await fetch("/api/orders", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ orderId, status }),
//     });

//     if (!res.ok) {
//       const errorResponse = await res.json().catch(() => null);
//       const errorMessage = errorResponse?.error || "Failed to update order status";
//       throw new Error(errorMessage);
//     }

//     return true;
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     throw new Error(error instanceof Error ? error.message : "Failed to update order status");
//   }
// }
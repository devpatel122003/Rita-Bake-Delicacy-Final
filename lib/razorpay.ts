export async function createRazorpayOrder(amount: number) {
  const baseUrl = "http://localhost:3000"; // Replace with your actual base URL

  try {
    const res = await fetch(`${baseUrl}/api/razorpay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      const errorResponse = await res.json().catch(() => null);
      const errorMessage = errorResponse?.error || "Failed to create Razorpay order";
      console.error("Razorpay API Error:", errorMessage); // Log the error
      throw new Error(errorMessage);
    }

    const result = await res.json();
    return result.order;
  } catch (error) {
    console.error("Error in createRazorpayOrder:", error); // Log the error
    throw new Error("Failed to create Razorpay order");
  }
}
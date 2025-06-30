import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

import { OrderStatus } from "@/types/order";

// Define valid status transitions with proper typing
const validStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  "not confirmed": ["payment pending", "cancelled"],
  "payment pending": ["confirmed", "cancelled"],
  "confirmed": ["preparing", "cancelled"],
  "preparing": ["out for delivery", "cancelled"],
  "out for delivery": ["delivered", "cancelled"],
  "delivered": [],
  "cancelled": []
};

// Helper function for type-safe status transition validation
function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return validStatusTransitions[currentStatus].includes(newStatus);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    const client = await clientPromise;
    const db = client.db("myDatabase");

    if (orderId) {
      // Fetch a single order by ID
      const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    } else {
      // Fetch all orders
      const orders = await db.collection("orders").find().toArray();
      const serializedOrders = orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
      }));
      return NextResponse.json({ success: true, orders: serializedOrders });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// export async function POST(request: Request) {
//   try {
//     const client = await clientPromise;
//     const db = client.db("myDatabase");
//     const body = await request.json();

//     // Handle user orders lookup by phone
//     if (body.phone) {
//       const orders = await db.collection("orders").find({ "customer.phone": body.phone }).toArray();
//       const serializedOrders = orders.map((order) => ({
//         ...order,
//         _id: order._id.toString(),
//       }));
//       return NextResponse.json({ success: true, orders: serializedOrders });
//     }

//     // For all orders, create them immediately with appropriate status
//     const orderData = {
//       type: body.type,
//       customer: body.customer,
//       status: body.type === "custom"
//         ? "not confirmed"
//         : (body.status === "confirmed" ? "confirmed" : "payment pending"),
//       paymentStatus: body.type === "custom"
//         ? "pending"
//         : (body.paymentStatus === "paid" ? "paid" : "pending"),
//       date: new Date(),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       ...(body.type === "custom" ? {
//         occasion: body.occasion,
//         cakeSize: body.cakeSize,
//         flavor: body.flavor,
//         description: body.description,
//         image: body.image || "",
//         requiredDate: body.requiredDate,
//         price: body.price || null,
//       } : {
//         items: body.items,
//         total: body.total,
//         price: body.price,
//         finalAmount: body.finalAmount,
//         discountAmount: body.discountAmount,
//         coupon: body.coupon
//       }),
//     };

//     const result = await db.collection("orders").insertOne(orderData);
//     return NextResponse.json({
//       success: true,
//       orderId: result.insertedId.toString(),
//       order: { ...orderData, _id: result.insertedId.toString() }
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("myDatabase");
    const body = await request.json();

    // Handle user orders lookup by phone
    if (body.phone) {
      const orders = await db.collection("orders").find({ "customer.phone": body.phone }).toArray();
      const serializedOrders = orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
      }));
      return NextResponse.json({ success: true, orders: serializedOrders });
    }

    // For all orders, create them immediately with appropriate status
    const currentDate = new Date();
    const orderData = {
      type: body.type,
      customer: body.customer,
      status: body.type === "custom"
        ? "not confirmed"
        : (body.status === "confirmed" ? "confirmed" : "payment pending"),
      paymentStatus: body.type === "custom"
        ? "pending"
        : (body.paymentStatus === "paid" ? "paid" : "pending"),
      date: currentDate,
      createdAt: currentDate,
      updatedAt: currentDate,
      requiredDate: body.type === "custom" ? body.requiredDate : currentDate, // Set requiredDate to current date for simple orders
      ...(body.type === "custom" ? {
        occasion: body.occasion,
        cakeSize: body.cakeSize,
        flavor: body.flavor,
        description: body.description,
        image: body.image || "",
        price: body.price || null,
      } : {
        items: body.items,
        total: body.total,
        price: body.price,
        finalAmount: body.finalAmount,
        discountAmount: body.discountAmount,
        coupon: body.coupon
      }),
    };

    const result = await db.collection("orders").insertOne(orderData);
    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
      order: { ...orderData, _id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// In route.ts, modify the PATCH handler:
export async function PATCH(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("myDatabase");
    const body = await request.json();

    const { orderId, amount, paymentId, signature } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: "Missing orderId or paymentId" },
        { status: 400 }
      );
    }

    // First get the current order
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const newStatus = "confirmed";

    // For simple orders, always allow confirmation if payment is successful
    if (order.type === "simple") {
      // No status validation needed for simple orders when confirming payment
    }
    // For custom orders, use the normal validation
    else if (!isValidStatusTransition(order.status, newStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${order.status} to confirmed` },
        { status: 400 }
      );
    }

    const updateResult = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentStatus: "paid",
          status: newStatus,
          paymentId: paymentId,
          updatedAt: new Date(),
          paymentMethod: "online",
          paymentAmount: amount,
          ...(signature && { paymentSignature: signature })
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order payment confirmed"
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("myDatabase");
    const body = await request.json();

    const { orderId, status, price, address, city, state, pincode } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Validate the order exists
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate status transition if status is being updated
    if (status && status !== order.status) {
      if (!isValidStatusTransition(order.status, status as OrderStatus)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${order.status} to ${status}` },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (price !== undefined) updateData.price = price;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;

    // Perform the update
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully"
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
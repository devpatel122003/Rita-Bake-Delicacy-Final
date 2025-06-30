// types/order.ts
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  _id?: string;
}

export type OrderStatus =
  | "not confirmed"
  | "payment pending"
  | "confirmed"
  | "preparing"
  | "out for delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface CouponApplied {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export interface Order {
  _id: string;
  type: "simple" | "custom";
  customer: Customer;
  items: OrderItem[];
  occasion?: string;
  cakeSize?: string;
  flavor?: string;
  description?: string;
  image?: string;
  requiredDate?: string | Date;
  total: number;
  price: number;
  finalAmount?: number;
  discountAmount?: number;
  coupon?: CouponApplied;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: "online" | "cod";
  paymentId?: string;
  paymentAmount?: number;
  paymentSignature?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deliveryDate?: Date | string;
  deliveryPerson?: string;
  deliveryContact?: string;
}
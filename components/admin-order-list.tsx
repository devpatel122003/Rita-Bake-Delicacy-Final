"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Order, OrderStatus } from "@/types/order";
import { fetchOrders, updateOrder } from "@/lib/orders";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Filter, Search, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [status, setStatus] = useState<OrderStatus>("not confirmed");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 767px)");

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const allOrders: Order[] = await fetchOrders();
        const sortedOrders = allOrders.sort((a: Order, b: Order) =>
          new Date(b.requiredDate ?? 0).getTime() - new Date(a.requiredDate ?? 0).getTime()
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
        showNotification("Failed to load orders", "error");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setStatus(selectedOrder.status as OrderStatus);
      setPrice(selectedOrder.price || null);
    }
  }, [selectedOrder]);

  useEffect(() => {
    let result = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order._id.toLowerCase().includes(query) ||
        order.customer?.name?.toLowerCase().includes(query) ||
        order.customer?.email?.toLowerCase().includes(query) ||
        order.customer?.phone?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter]);

  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    "not confirmed": ["payment pending"],
    "payment pending": ["confirmed", "cancelled"],
    "confirmed": ["preparing", "cancelled"],
    "preparing": ["out for delivery", "cancelled"],
    "out for delivery": ["delivered", "cancelled"],
    "delivered": [],
    "cancelled": [],
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, newPrice?: number) => {
    try {
      await updateOrder(orderId, newStatus, newPrice);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? ({
              ...order,
              status: newStatus,
              price: newPrice ?? order.price,
            } as Order)
            : order
        )
      );
      setIsDialogOpen(false);
      showNotification("Order updated successfully", "success");
    } catch (error) {
      console.error("Error updating order:", error);
      showNotification("Failed to update order", "error");
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    try {
      let newStatus = status;
      let newPrice = price;

      // Validate price
      if (newPrice !== null && (isNaN(newPrice) || newPrice < 0)) {
        showNotification("Please enter a valid price", "error");
        return;
      }

      // Auto-update status if price is set for pending order
      if (selectedOrder.status === "not confirmed" && newPrice !== null && newPrice !== selectedOrder.price) {
        newStatus = "payment pending";
      }

      await handleUpdateStatus(selectedOrder._id, newStatus, newPrice ?? undefined);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<OrderStatus, string> = {
      "not confirmed": "bg-yellow-200 text-yellow-800",
      "payment pending": "bg-purple-200 text-purple-800",
      confirmed: "bg-blue-200 text-blue-800",
      preparing: "bg-indigo-200 text-indigo-800",
      "out for delivery": "bg-orange-200 text-orange-800",
      delivered: "bg-green-200 text-green-800",
      "cancelled": "bg-red-200 text-red-800",
    };
    return statusColors[status as OrderStatus] || "bg-gray-200 text-gray-800";
  };

  const formatDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) return "N/A";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString();
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setStatus(order.status as OrderStatus);
    setPrice(order.price || null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-pink-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800">Manage Orders</h2>

      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:space-x-4 sm:items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search orders by ID, name, email..."
            className="pl-10 focus-visible:ring-pink-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not confirmed">Not Confirmed</SelectItem>
              <SelectItem value="payment pending">Payment Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="out for delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{filteredOrders.length}</span>
          {statusFilter !== "all" && <span> {statusFilter}</span>} orders
          {searchQuery && <span> matching "{searchQuery}"</span>}
        </p>
      </div>

      {isDesktop ? (
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{order._id.slice(-6)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer?.name || "N/A"}</p>
                        <p className="text-xs text-gray-500">{order.customer?.email || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.requiredDate ? formatDate(order.requiredDate) : "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} px-2 py-1`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.type}</TableCell>
                    <TableCell className="font-medium">
                      {order.price ? `₹${order.price}` : "Not set"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => openOrderDetails(order)}
                        className="bg-pink-600 hover:bg-pink-700 text-white transition-colors"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : isTablet ? (
        <div className="hidden sm:block md:hidden">
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 col-span-2">
                No orders found
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-sm text-gray-500">Order #{order._id.slice(-6)}</p>
                          <h3 className="font-medium">{order.customer?.name || "N/A"}</h3>
                          <p className="text-xs text-gray-500">{order.customer?.email || "N/A"}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} ml-2`}>
                          {order.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Required Date</p>
                          <p className="font-medium">{order.requiredDate ? formatDate(order.requiredDate) : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-medium">{order.price ? `₹${order.price}` : "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium">{order.type || "N/A"}</p>
                        </div>
                        {order.type === "custom" && (
                          <div>
                            <p className="text-gray-500">Flavor</p>
                            <p className="font-medium">{order.flavor || "N/A"}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t">
                      <Button
                        onClick={() => openOrderDetails(order)}
                        className="w-full py-3 rounded-none bg-white hover:bg-gray-50 text-pink-600 transition-colors flex items-center justify-center"
                        variant="ghost"
                      >
                        View Details <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="sm:hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-sm text-gray-500">Order #{order._id.slice(-6)}</p>
                          <h3 className="font-medium">{order.customer?.name || "N/A"}</h3>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} ml-2`}>
                          {order.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Required Date</p>
                          <p className="font-medium">{order.requiredDate ? formatDate(order.requiredDate) : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-medium">{order.price ? `₹${order.price}` : "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium">{order.type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium">{order.customer?.phone || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t">
                      <Button
                        onClick={() => openOrderDetails(order)}
                        className="w-full py-3 rounded-none bg-white hover:bg-gray-50 text-pink-600 flex items-center justify-center"
                        variant="ghost"
                      >
                        View Details <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">Order #{selectedOrder?._id.slice(-6)}</DialogTitle>
            <Badge className={`${selectedOrder ? getStatusColor(selectedOrder.status) : ''} px-2 py-1`}>
              {selectedOrder?.status}
            </Badge>
          </DialogHeader>

          {selectedOrder && (
            <div className="flex-1 overflow-y-auto pr-1 -mr-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7 space-y-6">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <h3 className="col-span-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Customer Information
                    </h3>

                    <div className="py-1">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedOrder.customer?.name || "N/A"}</p>
                    </div>

                    <div className="py-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-sm truncate" title={selectedOrder.customer?.email || "N/A"}>
                        {selectedOrder.customer?.email || "N/A"}
                      </p>
                    </div>

                    <div className="py-1">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedOrder.customer?.phone || "N/A"}</p>
                    </div>

                    <div className="py-1">
                      <p className="text-sm text-gray-500">Order Type</p>
                      <p className="font-medium">{selectedOrder.type}</p>
                    </div>

                    <div className="py-1">
                      <p className="text-sm text-gray-500">Required Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.requiredDate)}</p>
                    </div>

                    <div className="py-1">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium">{selectedOrder.price ? `₹${selectedOrder.price}` : "Not set"}</p>
                    </div>
                  </div>

                  {(selectedOrder.address || selectedOrder.city || selectedOrder.state || selectedOrder.pincode) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">
                        Shipping Information
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        {selectedOrder.address && <p className="text-sm">{selectedOrder.address}</p>}
                        <p className="text-sm">
                          {[
                            selectedOrder.city,
                            selectedOrder.state,
                            selectedOrder.pincode
                          ].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.type === "simple" && selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Order Items
                      </h3>
                      <div className="bg-gray-50 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedOrder.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 text-sm">{item.name}</td>
                                <td className="px-3 py-2 text-sm text-center">{item.quantity}</td>
                                <td className="px-3 py-2 text-sm text-right">₹{item.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedOrder.type === "custom" && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Custom Cake Details
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 p-3 rounded-md">
                        <div>
                          <p className="text-sm text-gray-500">Occasion</p>
                          <p className="font-medium">{selectedOrder.occasion || "N/A"}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Cake Size</p>
                          <p className="font-medium">{selectedOrder.cakeSize || "N/A"}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Flavor</p>
                          <p className="font-medium">{selectedOrder.flavor || "N/A"}</p>
                        </div>

                        <div className="col-span-2 mt-1">
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="font-medium text-sm">{selectedOrder.description || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-5 space-y-5">
                  {selectedOrder.image && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Reference Image</p>
                      <div className="bg-gray-50 p-2 rounded-md flex items-center justify-center h-56">
                        <img
                          src={selectedOrder.image}
                          alt="Custom Cake"
                          className="max-w-full max-h-52 object-contain rounded"
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-md space-y-4">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Order Management
                    </h3>

                    {(selectedOrder.status === "not confirmed" || selectedOrder.status === "payment pending") && (
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-medium">
                          {selectedOrder.price ? "Update Price" : "Set Price"}
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="Enter price in ₹"
                          value={price ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPrice(value ? Number(value) : null);
                          }}
                          className="focus-visible:ring-pink-500"
                        />
                        {selectedOrder.status === "not confirmed" && !selectedOrder.price && (
                          <p className="text-xs text-gray-500">
                            Setting a price will move order to "Payment Pending"
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Update Status</Label>
                      <Select
                        value={status}
                        onValueChange={(value) => setStatus(value as OrderStatus)}
                        disabled={!selectedOrder || validTransitions[selectedOrder.status as OrderStatus]?.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={selectedOrder.status}>
                            {selectedOrder.status} (current)
                          </SelectItem>
                          {validTransitions[selectedOrder.status as OrderStatus].map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validTransitions[selectedOrder.status as OrderStatus].length === 0 && (
                        <p className="text-xs text-gray-500">This order has reached its final status</p>
                      )}
                    </div>

                    <Button
                      onClick={handleSaveChanges}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white transition-colors"
                      disabled={
                        status === selectedOrder.status &&
                        (price === selectedOrder.price ||
                          (price === null && selectedOrder.price === null) ||
                          (price !== null && isNaN(price)))
                      }
                    >
                      Save Changes
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Status Workflow
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center text-xs">
                        <div className={`text-center ${selectedOrder.status === "not confirmed" ? "text-pink-600 font-bold" : "text-gray-500"}`}>
                          New
                        </div>
                        <div className={`text-center ${selectedOrder.status === "payment pending" ? "text-pink-600 font-bold" : "text-gray-500"}`}>
                          Payment
                        </div>
                        <div className={`text-center ${selectedOrder.status === "confirmed" ? "text-pink-600 font-bold" : "text-gray-500"}`}>
                          Confirmed
                        </div>
                        <div className={`text-center ${selectedOrder.status === "preparing" ? "text-pink-600 font-bold" : "text-gray-500"}`}>
                          Making
                        </div>
                        <div className={`text-center ${selectedOrder.status === "out for delivery" ? "text-pink-600 font-bold" : "text-gray-500"}`}>
                          Shipping
                        </div>
                        <div className={`text-center ${selectedOrder.status === "delivered" ? "text-pink-600 font-bold" : "text-gray-500"}`}>
                          Done
                        </div>
                      </div>

                      <div className="relative mt-2">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                        <div
                          className="absolute top-1/2 left-0 h-1 bg-pink-500 -translate-y-1/2"
                          style={{
                            width: `${selectedOrder.status === "not confirmed" ? "0%" :
                              selectedOrder.status === "payment pending" ? "20%" :
                                selectedOrder.status === "confirmed" ? "40%" :
                                  selectedOrder.status === "preparing" ? "60%" :
                                    selectedOrder.status === "out for delivery" ? "80%" :
                                      "100%"
                              }`
                          }}
                        ></div>
                        <div className="relative flex justify-between">
                          <div className={`w-3 h-3 rounded-full ${["not confirmed", "payment pending", "confirmed", "preparing", "out for delivery", "delivered"]
                            .indexOf(selectedOrder.status) >= 0 ? "bg-pink-500" : "bg-gray-300"
                            }`}></div>
                          <div className={`w-3 h-3 rounded-full ${["payment pending", "confirmed", "preparing", "out for delivery", "delivered"]
                            .indexOf(selectedOrder.status) >= 0 ? "bg-pink-500" : "bg-gray-300"
                            }`}></div>
                          <div className={`w-3 h-3 rounded-full ${["confirmed", "preparing", "out for delivery", "delivered"]
                            .indexOf(selectedOrder.status) >= 0 ? "bg-pink-500" : "bg-gray-300"
                            }`}></div>
                          <div className={`w-3 h-3 rounded-full ${["preparing", "out for delivery", "delivered"]
                            .indexOf(selectedOrder.status) >= 0 ? "bg-pink-500" : "bg-gray-300"
                            }`}></div>
                          <div className={`w-3 h-3 rounded-full ${["out for delivery", "delivered"]
                            .indexOf(selectedOrder.status) >= 0 ? "bg-pink-500" : "bg-gray-300"
                            }`}></div>
                          <div className={`w-3 h-3 rounded-full ${["delivered"]
                            .indexOf(selectedOrder.status) >= 0 ? "bg-pink-500" : "bg-gray-300"
                            }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Component */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[9999] max-w-xs sm:max-w-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <XCircle className="h-6 w-6" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
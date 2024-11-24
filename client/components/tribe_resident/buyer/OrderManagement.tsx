"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import BuyerOrderCard from "@/components/tribe_resident/buyer/BuyerOrderCard";
import { Order } from "@/interfaces/tribe_resident/buyer/order";
import UserService from "@/services/user/user";

interface OrderManagementProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[]; // List of orders passed as props
  fetchOrders: () => void; // Function to refetch orders
}

const OrderManagement: React.FC<OrderManagementProps> = ({ isOpen, onClose, orders, fetchOrders }) => {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [user, setUser] = useState(UserService.getLocalStorageUser());

  // State variables for order filtering
  const [orderStatus, setOrderStatus] = useState<string>("未接單");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string>("");


  // Filter orders based on the logged-in user's ID
  useEffect(() => {
    if (user && user.id) {
      const userOrders = orders.filter((order) => order.buyer_id === user.id);
      setFilteredOrders(userOrders);
    }
  }, [orders, user]);

  /**
   * Memoized function to filter orders based on status and date range
   */
  const finalFilteredOrders = useMemo(() => {
    
    const now = new Date();

    return filteredOrders.filter((order) => {

      const matchesStatus = order.order_status === orderStatus;

      
      // Filter orders based on status and date range
      if (orderStatus === "未接單") {
        return matchesStatus;
      } else if (orderStatus === "接單" || orderStatus === "已完成") {
        return matchesStatus;
      }

      return false;
     
    });
  }, [filteredOrders, orderStatus]);

  /**
   * Calculate the total price of the filtered orders
   */
  const totalPrice = finalFilteredOrders.reduce((total, order) => total + order.total_price, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-2xl h-full overflow-y-auto" aria-describedby="form-description">
        <SheetHeader>
          <SheetTitle>我的訂單</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <div className="p-4">
          {/* Filtering controls */}
          <>
            {/* Order status buttons */}
            <div className="w-full flex justify-center space-x-2 mt-4">
              <Button
                variant={orderStatus === "未接單" ? "default" : "outline"}
                onClick={() => setOrderStatus("未接單")}
              >
                未接單
              </Button>
              <Button
                variant={orderStatus === "接單" ? "default" : "outline"}
                onClick={() => setOrderStatus("接單")}
              >
                接單
              </Button>
              <Button
                variant={orderStatus === "已完成" ? "default" : "outline"}
                onClick={() => setOrderStatus("已完成")}
              >
                已完成
              </Button>
            </div>

            {/* Display total price if there are matching orders */}
            {finalFilteredOrders.length > 0 && (
              <div className="w-full flex justify-center mt-4">
                <span className="text-lg font-bold">總金額: {totalPrice.toFixed(2)} 元</span>
              </div>
            )}
          </>

          {/* Render order cards or display a message if no orders match */}
          {filteredOrders.length > 0 ? (
            finalFilteredOrders.length > 0 ? (
              finalFilteredOrders.map((order) => (
                <BuyerOrderCard key={order.id} order={order} />
              ))
            ) : (
              <p className="mt-4 text-center">沒有符合條件的訂單</p>
            )
          ) : (
            <p className="mt-4 text-center"> 沒有相關的訂單</p>
          )}

          {/* Display error message if needed */}
          {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderManagement;

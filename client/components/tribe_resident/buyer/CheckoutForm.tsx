"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import UserService from '@/services/user/user';  

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
};

type CheckoutFormProps = {
  onClose: () => void;
  clearCart: () => void;
  cartItems: CartItem[];
  totalPrice: number;
};

/**
 * CheckoutForm component for submitting an order.
 * @param onClose - Function to close the form.
 * @param clearCart - Function to clear the cart.
 * @param cartItems - Array of items in the cart.
 * @param totalPrice - Total price of the items in the cart.
 */
const CheckoutForm: React.FC<CheckoutFormProps> = ({ onClose, clearCart, cartItems, totalPrice }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [is_urgent, setIsUrgent] = useState(false);
  const [note, setNote] = useState<string>("");  // Note field
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get user information from local storage and pre-fill it into the form
    const user = UserService.getLocalStorageUser();  
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, []);


  /**
   * Handles the form submission.
   */
  const handleSubmit = async () => {
    // Clear previous errors
    setError("");

    // Validate the name (only Chinese or English characters)
    if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(name)) {
      setError("姓名必須填寫而且只能包含中文或英文");
      return;
    }

    // Validate the phone
    if (!/^\d{7,10}$/.test(phone)) {
      setError("電話號碼長度錯誤");
      return;
    }

    // Validate the date
    if (!date || date < new Date()) {
      setError("未選擇日期或不能選比現在的時間更早");
      return;
    }

    // Validate the time
    if (!time) {
      setError("未選擇時間");
      return;
    }

    // Validate the location
    if (!location) {
      setError("未選擇地點");
      return;
    }

    const user = UserService.getLocalStorageUser();

    // All validations passed
    const orderData: {
      id?: number;
      buyer_id: number;
      buyer_name: string;
      buyer_phone: string;
      seller_id: number;
      seller_name: string;
      seller_phone: string;
      date: string;
      time: string;
      location: string;
      is_urgent: boolean;
      total_price: number;
      order_type: string;
      order_status: string;
      note: string;
      shipment_count: number;
      required_orders_count: number;
      previous_driver_id: null;
      previous_driver_name: null;
      previous_driver_phone: null;
      items: {
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
        img: string;
      }[];
    } = {
      buyer_id: user.id ,  // TODO: Replace with the actual buyer ID  =>login function
      buyer_name: name,
      buyer_phone: phone,
      seller_id: 1,  // TODO: Replace with the actual buyer ID => login function
      seller_name: '賣家名稱', 
      seller_phone: '賣家電話',
      date: date.toISOString().split('T')[0], 
      time: time, 
      location: location,
      is_urgent: is_urgent,
      total_price: totalPrice,
      order_type: "購買類",
      order_status: "未接單",
      note: note,
      shipment_count: 1,  //TODO: seller function
      required_orders_count: 1,  //TODO: seller function
      previous_driver_id: null,
      previous_driver_name: null,
      previous_driver_phone: null,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        img: item.img
      }))
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const result = await response.json();
      console.log('Order submitted:', result);

      // Set the ID from the response to the orderData
      orderData.id = result.id;

      setShowAlert(true);
      clearCart();
      setTimeout(() => {
        setShowAlert(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('提交訂單時出錯');
    }
  };

  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-2xl" aria-describedby="checkout-form-description">
          <SheetHeader>
            <SheetTitle>結帳資訊</SheetTitle>
            <SheetClose />
          </SheetHeader>
          <div id="checkout-form-description" className="p-4">
            {showAlert && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">提交成功!</strong>
                <span className="block sm:inline">您的訂單提交成功，請等候司機接單。</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="mb-4">
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700">姓名</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="輸入您的姓名" />
            </div>
            <div className="mb-4">
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="輸入您的電話" />
            </div>
            <div className="mb-4">
              <Label htmlFor="date" className="block text-sm font-medium text-gray-700">可以接受司機接單的最後日期(超過時間沒有司機接單就放棄)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={"w-full justify-start text-left font-normal"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>選擇日期</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4">
              <Label htmlFor="time" className="block text-sm font-medium text-gray-700">可以接受司機接單的最後時間(超過時間沒有司機接單就放棄)</Label>
              <Select onValueChange={setTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇時間" />
                </SelectTrigger>
                <SelectContent>
                  {["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700">領貨的地點</Label>
              <Select onValueChange={setLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇地點" />
                </SelectTrigger>
                <SelectContent>
                  {["飛鼠不渴露營農場", "樹不老休閒莊園", "戀戀雅渡農場"].map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="urgent" className="block text-sm font-medium text-gray-700">是否緊急</Label>
              <Checkbox id="urgent" checked={is_urgent} onCheckedChange={(checked: boolean) => setIsUrgent(checked)} />
            </div>
            <div className="mb-4">
              <Label htmlFor="note" className="block text-sm font-medium text-gray-700">備註</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="輸入備註 (選填)" />
            </div>
          </div>
          <SheetFooter>
            <Button className="bg-black text-white" onClick={handleSubmit}>提交</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CheckoutForm;

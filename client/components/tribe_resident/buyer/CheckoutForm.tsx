"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import UserService from '@/services/user/user';  
import { CheckoutFormProps } from '@/interfaces/tribe_resident/buyer/buyer';
import { Autocomplete, useJsApiLoader, LoadScriptProps } from "@react-google-maps/api";
import { now } from 'lodash';

// Define the required libraries
const libraries: LoadScriptProps['libraries'] = ["places"] as const;

// Define the container style for Google Maps (if you don't need to display the map, set width and height to 0)
const containerStyle = {
  width: "0px",
  height: "0px",
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
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<string>(""); 
  const [is_urgent, setIsUrgent] = useState(false);
  const [note, setNote] = useState<string>("");  // Note field
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'zh-TW',
  });

  useEffect(() => {
    // Get user information from local storage and pre-fill it into the form
    const user = UserService.getLocalStorageUser();  
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, []);

  /**
   * Handle location changes, especially when selecting "Custom"
   */
  const handleLocationChange = (value: string) => {
    if (value === "custom") {
      setIsCustomLocation(true);
      setLocation("");
      setInputValue(""); 
    } else {
      setIsCustomLocation(false);
      setLocation(value);
      setInputValue(value); 
    }
  };

  /**
   * Handle location selection from Google Maps Autocomplete
   */
  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      console.log("onPlaceChanged 被調用");
      console.log("選中的 place:", place); 

      if (place && (place.formatted_address || place.name)) {
        const selectedAddress = place.formatted_address || place.name;
        console.log("選中的地址:", selectedAddress);
        setLocation(selectedAddress);
        if (selectedAddress) {
          setInputValue(selectedAddress); 
        }
        setError("");
      } else {
        setError("請選擇有效的地點");
      }
    } else {
      setError("Autocomplete 尚未加載完成！");
    }
  };

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
      seller_id?: number;
      seller_name?: string;
      seller_phone?: string;
      date?: string;
      time?: string;
      location: string;
      is_urgent: boolean;
      total_price: number;
      order_type: string;
      order_status: string;
      note: string;
      service: string;
      shipment_count?: number;
      required_orders_count?: number;
      previous_driver_id?: null;
      previous_driver_name?: null;
      previous_driver_phone?: null;
      items: {
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
        img: string;
        location: string;
        category: string;
      }[];
    } = {
      buyer_id: user.id ,       
      buyer_name: name,
      buyer_phone: phone,
      seller_id: 1,             // TODO: Replace with the actual buyer ID => login function
      seller_name: '賣家名稱', 
      seller_phone: '賣家電話',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      location: location,
      is_urgent: is_urgent,
      total_price: totalPrice,
      order_type: "購買類",
      order_status: "未接單",
      note: note,
      service: 'necessities',
      shipment_count: 1,         // TODO: seller function
      required_orders_count: 1,  // TODO: seller function
      previous_driver_id: null,
      previous_driver_name: null,
      previous_driver_phone: null,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        img: item.img,
        location: item.location || "家樂福",
        category: item.category
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
      }, 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('提交訂單時出錯');
    }
  };

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-2xl overflow-y-auto" aria-describedby="checkout-form-description">
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
              <Input 
                id="name" 
                value={name} 
                readOnly  
                className="bg-gray-100 text-gray-500 cursor-not-allowed"  
                onChange={(e) => setName(e.target.value)} 
                placeholder="輸入您的姓名" 
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話</Label>
              <Input 
                id="phone" 
                value={phone} 
                readOnly  
                className="bg-gray-100 text-gray-500 cursor-not-allowed"  
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="輸入您的電話" 
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700">領貨的地點</Label>
              <Select onValueChange={handleLocationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇地點" />
                </SelectTrigger>
                <SelectContent>
                  {["飛鼠不渴露營農場", "樹不老休閒莊園", "戀戀雅渡農場", "國立政治大學大門", "自定義"].map(locationOption => (
                    <SelectItem key={locationOption} value={locationOption === "自定義" ? "custom" : locationOption}>
                      {locationOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCustomLocation && (
                <div className="mt-4">
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocompleteRef.current = autocomplete;
                    }}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      fields: [
                        "address_components",
                        "geometry",
                        "icon",
                        "name",
                        "formatted_address",
                        "place_id",
                        "types",
                      ], 
                      types: ["establishment", "geocode"], 
                    }}
                  >
                    <Input
                      type="text"
                      placeholder="搜尋或輸入地點"
                      className="w-full"
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)} 
                    />
                  </Autocomplete>
                </div>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="urgent" className="block text-sm font-medium text-gray-700">是否緊急</Label>
              <Checkbox id="urgent" checked={is_urgent} onCheckedChange={(checked: boolean) => setIsUrgent(checked)} />
            </div>
            <div className="mb-4">
              <Label htmlFor="note" className="block text-sm font-medium text-gray-700">備註</Label>
              <Input 
                id="note" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="輸入備註 (選填)" 
              />
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

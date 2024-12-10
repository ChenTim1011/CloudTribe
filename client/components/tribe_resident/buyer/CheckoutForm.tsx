"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import UserService from '@/services/user/user';  
import { CheckoutFormProps } from '@/interfaces/tribe_resident/buyer/buyer';
import { useJsApiLoader, LoadScriptProps } from "@react-google-maps/api";
import { set } from 'lodash';

const libraries: LoadScriptProps['libraries'] = ["places"];

const containerStyle = {
  width: "0px",
  height: "0px",
};

// Custom hook for debouncing input values
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Format prediction description to highlight business name
const formatPredictionDisplay = (prediction: google.maps.places.AutocompletePrediction) => {
  const businessName = prediction.structured_formatting.main_text;
  const address = prediction.structured_formatting.secondary_text;

  return {
    businessName: businessName || '',
    address: address || ''
  };
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onClose, clearCart, cartItems, totalPrice }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [is_urgent, setIsUrgent] = useState(false);
  const [note, setNote] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isManualInput, setIsManualInput] = useState(true);
  // Initialize debounced search term
  const debouncedSearchTerm = useDebounce(searchInput, 800);

  // Service references for Google Places API
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'zh-TW'
  });

  useEffect(() => {
    const user = UserService.getLocalStorageUser();  
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, []);

  // Initialize Google Places services
  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      placesService.current = new google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  // Fetch predictions when search term changes
  useEffect(() => {
    if (isManualInput && debouncedSearchTerm && autocompleteService.current) {
      const searchQuery = {
        input: debouncedSearchTerm,
        language: 'zh-TW',
        componentRestrictions: { country: 'tw' },
        types: ['establishment']
      };

      autocompleteService.current.getPlacePredictions(
        searchQuery,
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  }, [debouncedSearchTerm,isManualInput]);

  // Handle place selection
  const handlePlaceSelect = (placeId: string) => {
    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'name']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const fullAddress = `${place.name} ${place.formatted_address}`;
            setLocation(fullAddress);
            setSearchInput(fullAddress);
            setIsManualInput(false);
            setPredictions([]);
            setError("");
          } else {
            setError("無法獲取地點詳細資訊");
          }
        }
      );
    }
  };

  // Handle input change for search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setIsManualInput(true);
    if (!value) {
      setPredictions([]);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(name)) {
      setError("姓名必須填寫而且只能包含中文或英文");
      return;
    }

    if (!/^\d{7,10}$/.test(phone)) {
      setError("電話號碼長度錯誤");
      return;
    }

    if (!location) {
      setError("未選擇地點");
      return;
    }

    const user = UserService.getLocalStorageUser();

    const orderData = {
      buyer_id: user.id,       
      buyer_name: name,
      buyer_phone: phone,
      seller_id: 1,
      seller_name: '賣家名稱', 
      seller_phone: '00000000',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      location: location,
      is_urgent: is_urgent,
      total_price: totalPrice,
      order_type: "購買類",
      order_status: "未接單",
      note: note,
      service: 'necessities',
      shipment_count: 1,
      required_orders_count: 1,
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
    return <div>地圖載入失敗</div>;
  }

  if (!isLoaded) {
    return <div>載入中...</div>;
  }

  return (
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
          <div className="mb-4 relative">
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700">領貨的地點</Label>
            <div className="relative">
              <Input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                placeholder="搜尋地點"
                className="w-full"
              />
              {predictions.length > 0 && (
                <div className="absolute z-50 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                  {predictions.map((prediction) => {
                    const { businessName, address } = formatPredictionDisplay(prediction);
                    return (
                      <div
                        key={prediction.place_id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePlaceSelect(prediction.place_id)}
                      >
                        <div className="font-medium text-gray-900">{businessName}</div>
                        <div className="text-sm text-gray-500">{address}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {location && (
              <div className="mt-2 text-sm text-gray-600">
                選擇的地點: {location}
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
  );
};

export default CheckoutForm;
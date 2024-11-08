"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { AddItemFormProps } from "@/interfaces/tribe_resident/buyer/AddItemFormProps";
import {
  GoogleMap,
  Autocomplete,
  useJsApiLoader,
  LoadScriptProps,
} from "@react-google-maps/api";

// Define the required libraries
const libraries: LoadScriptProps["libraries"] = ["places"];

/**
 * Define the container style for Google Maps (set width and height to 0 if you don't need to display the map)
 */
const containerStyle = {
  width: "0px",
  height: "0px",
};

/**
 * Represents the form for adding an item to the cart with location autocomplete.
 * @param onClose - Callback function to close the form.
 * @param addToCart - Function to add the item to the cart.
 */
const AddItemForm: React.FC<AddItemFormProps> = ({ onClose, addToCart }) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<string | number>("");
  const [price, setPrice] = useState<string | number>("");
  const [location, setLocation] = useState<string>("");
  const [error, setError] = useState("");

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: "zh-TW",
  });

  /**
   * Handles the place selection from Autocomplete.
   */
  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      console.log("Selected place:", place); // Debug log
      if (place && place.formatted_address) {
        setLocation(place.formatted_address);
        setError("");
      } else if (place && place.name) {
        // If there's no formatted_address, use name
        setLocation(place.name);
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
   * Resets the error message, validates the input fields, and adds the item to the cart.
   */
  const handleSubmit = () => {
    // Reset the error message
    setError("");

    // Validate the name
    if (!name.trim()) {
      setError("商品名稱不能是空的");
      return;
    }

    // Validate the quantity
    if (Number(quantity) <= 0 || !quantity) {
      setError("數量必須大於零");
      return;
    }

    // Validate the price
    if (Number(price) <= 0 || !price) {
      setError("價格必須大於零");
      return;
    }

    // Validate the location
    if (!location.trim()) {
      setError("地點不能是空的");
      return;
    }

    addToCart({
      name: name.trim(),
      quantity: Number(quantity),
      price: Number(price),
      location: location.trim(),
      img: "/external-image/on/demandware.static/-/Sites-carrefour-tw-m-inner/default/dwa27eb49f/images/large/3270236800101.jpg",
    });
    onClose();
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent
        className="w-full max-w-2xl overflow-visible z-50" // Changed overflow-y-auto to overflow-visible and added z-50
      >
        <SheetHeader>
          <SheetTitle>如果找不到，想要買的東西</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          {error && <div className="text-red-500 mb-10">{error}</div>}
          <div className="mb-10">
            <label className="mb-5 block text-sm font-medium text-gray-700">
              商品名稱(品牌/名稱/大小)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入商品名稱"
            />
          </div>
          <div className="mb-10">
            <label className="mb-5 block text-sm font-medium text-gray-700">
              購買數量
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
              placeholder="輸入購買數量"
            />
          </div>
          <div className="mb-10">
            <label className="mb-5 block text-sm font-medium text-gray-700">
              購買價格
            </label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={1}
              placeholder="輸入購買價格"
            />
          </div>
          <div className="mb-10 relative"> {/* Added relative positioning */}
            <label className="mb-5 block text-sm font-medium text-gray-700">
              地點
            </label>
            <Autocomplete
              onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
              }}
              onPlaceChanged={onPlaceChanged}
              options={{
                fields: ["formatted_address", "name"], // Specify required fields
                types: ["establishment", "geocode"], // Specify types as needed
              }}
            >
              <Input
                type="text"
                placeholder="搜尋地點"
                className="w-full"
                // Removed value and onChange to avoid control conflicts
                // Let Autocomplete control the input's value
              />
            </Autocomplete>
            {/* Display the selected location */}
            {location && (
              <div className="mt-2 text-sm text-gray-600">
                選擇的地點: {location}
              </div>
            )}
          </div>
        </div>
        <SheetFooter>
          <Button className="bg-black text-white" onClick={handleSubmit}>
            加入購物車
          </Button>
        </SheetFooter>
      </SheetContent>
      {/* Optional: Google Map component if you want to display the map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: 0, lng: 0 }}
        zoom={2}
        onLoad={(map) => {
          // You can perform additional map setup here if needed
        }}
      />
    </Sheet>
  );
};

export default AddItemForm;

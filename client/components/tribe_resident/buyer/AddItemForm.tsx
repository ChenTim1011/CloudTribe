"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { AddItemFormProps } from "@/interfaces/tribe_resident/buyer/buyer";
import {
  GoogleMap,
  Autocomplete,
  useJsApiLoader,
  LoadScriptProps,
} from "@react-google-maps/api";

const libraries: LoadScriptProps["libraries"] = ["places"];

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
  // Use structured_formatting to access main_text and secondary_text
  const businessName = prediction.structured_formatting.main_text;
  // secondary_text is usually the address
  const address = prediction.structured_formatting.secondary_text;

  return {
    businessName: businessName || '',
    address: address || ''
  };
};

const AddItemForm: React.FC<AddItemFormProps> = ({ onClose, addToCart }) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<string | number>("");
  const [price, setPrice] = useState<string | number>("");
  const [location, setLocation] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [error, setError] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isManualInput, setIsManualInput] = useState(true);
  // Initialize debounced search term
  const debouncedSearchTerm = useDebounce(searchInput, 1000);

  // Service references for Google Places API
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: "zh-TW",
  });

  // Fetch predictions when search term changes
  useEffect(() => {
    if (isManualInput && debouncedSearchTerm && autocompleteService.current) {
      const searchQuery = {
        input: debouncedSearchTerm,
        language: 'zh-TW',
        componentRestrictions: { country: 'tw' },
        types: ['establishment'] // Focus on businesses and establishments
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

  // Initialize Google Places services
  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      placesService.current = new google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

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
            const fullLocation = `${place.name} ${place.formatted_address}`;
            setLocation(fullLocation);
            setSearchInput(fullLocation);
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

  // Form submission handler
  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("商品名稱不能是空的");
      return;
    }

    if (Number(quantity) <= 0 || !quantity) {
      setError("數量必須大於零");
      return;
    }

    if (Number(price) <= 0 || !price) {
      setError("價格必須大於零");
      return;
    }

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
    return <div>地圖載入失敗</div>;
  }

  if (!isLoaded) {
    return <div>載入中...</div>;
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-2xl overflow-visible z-50">
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
          <div className="mb-10 relative">
            <label className="mb-5 block text-sm font-medium text-gray-700">
              地點
            </label>
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
        </div>
        <SheetFooter>
          <Button className="bg-black text-white" onClick={handleSubmit}>
            加入購物車
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddItemForm;
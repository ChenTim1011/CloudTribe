'use client'
import React, { useState, useEffect, useRef } from "react";
import { User } from '@/interfaces/user/user';
import { UploadItem } from '@/interfaces/tribe_resident/seller/seller';
import UserService from '@/services/user/user'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import  SellerService from '@/services/seller/seller'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/tribe_resident/seller/DatePicker";
import { CategorySelector } from "@/components/tribe_resident/seller/CategorySelector";
import { UploadRegion } from "@/components/tribe_resident/seller/UploadRegion"
import { useJsApiLoader, LoadScriptProps } from "@react-google-maps/api";

const libraries: LoadScriptProps['libraries'] = ["places"];
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
export const SellerDialog = () => {
  const [imgBase64, setImgBase64] = useState('')
  const [date, setDate] = useState<Date>()
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [itemUnit, setItemUnit] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fileType, setFileType] = useState('')
  const [closeDialog, setCloseDialog] = useState(false)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [user, setUser] = useState<User>()
  const [isUploading, setIsUploading] = useState(false)
  const [location, setLocation] = useState<string>("empty");
  const [searchInput, setSearchInput] = useState<string>("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isManualInput, setIsManualInput] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initialize debounced search term
  const debouncedSearchTerm = useDebounce(searchInput, 1000);

  // Service references for Google Places API
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'zh-TW'
  });


  useEffect(() => {
    const _user = UserService.getLocalStorageUser()
    setUser(_user)
  }, [])
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
  }, [debouncedSearchTerm, isManualInput]);

  const handleConfirm = async () => {
    //get image URL
    if (itemName == '' || itemPrice == '' || date == null || selectedCategory == null || itemQuantity == '' || itemUnit == '') {
      setErrorMessage("上面的所有欄位都必須要填寫喔!!");
      return;
    }

    else if (itemName.length > 20) {
      setErrorMessage("商品名稱大於20字");
      return;
    } else if (isNaN(parseInt(itemPrice)) || parseInt(itemPrice) <= 0) {
      setErrorMessage("金額欄位輸入錯誤");
      return;
    } else if (isNaN(parseInt(itemQuantity)) || parseInt(itemQuantity) <= 0) {
      setErrorMessage("數量欄位輸入錯誤");
      return;
    } else if (new Date(date) < new Date()) {
      setErrorMessage("時間選擇有誤");
      return;
    } else if (fileType == '') {
      setErrorMessage("未選擇任何檔案");
      return;
    } else if (fileType == 'notImage') {
      setErrorMessage("上傳的檔案非圖片");
      return;
    } else if (location == 'empty') {
      setErrorMessage("未設定放置地點");
      return;
    }

    setIsUploading(true);
    try {
      const res_img = await SellerService.upload_image(imgBase64);
      const item: UploadItem = {
        name: itemName,
        price: itemPrice,
        category: selectedCategory,
        total_quantity: itemQuantity,
        off_shelf_date: date.toLocaleDateString().replaceAll("/", "-"),
        img_link: res_img.img_link,
        img_id: res_img.img_id,
        seller_id: user && user.id ? Number(user.id) : null,
        unit: itemUnit,
        location: location,
      };
      const res_item = await SellerService.upload_item(item);
      setCloseDialog(true);
    } catch (e: any) {
      setErrorMessage(e.message || '上傳發生錯誤，請再試一次');
      setIsUploading(false);
    }
  };
  const handleNameButton: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setItemName(event.target.value);
    setErrorMessage('')
  }
  const handlePriceButton: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setItemPrice(event.target.value);
    setErrorMessage('')
  }
  const handleQuantityButton: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setItemQuantity(event.target.value);
    setErrorMessage('')
  }
  const handleUnitButton: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setItemUnit(event.target.value);
    setErrorMessage('')
  }

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    setErrorMessage('')
  }

  const handleSelector = (isOpen: boolean, value: string) => {
    setIsSelectorOpen(isOpen)
    setSelectedCategory(value)
  }
  const handleAddItem = () => {
    setCloseDialog(false)
    setIsUploading(false)
  }
  // Format prediction description
  const formatPredictionDisplay = (prediction: google.maps.places.AutocompletePrediction) => {
    const businessName = prediction.structured_formatting.main_text;
    const address = prediction.structured_formatting.secondary_text;

    return {
      businessName: businessName || '',
      address: address || ''
    };
  };
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
            setError(null);
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
  return (
    <div>
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-black text-white w-1/2 bottom-0 fixed left-1/4 my-4"
          onClick={handleAddItem}>
            新增商品
        </Button>
      </DialogTrigger>

      <DialogContent className="lg:max-w-[800px] max-w-[400px] h-[90vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle className="lg:text-3xl text-2xl">請輸入上架商品資訊</DialogTitle>
          <DialogDescription className="lg:text-lg text-sm">
            請確實填寫內容
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-4">
            <div className="mb-6 flex flex-col items-center">
              <Label className="block text-left lg:text-2xl text-md mb-2 self-start">
                下架日期
              </Label>
              <div className="flex justify-center w-full">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  className="rounded-md border bg-white"
                />
              </div>
            </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left lg:text-2xl text-md">
              商品名稱
            </Label>
            <Input 
              id="name" 
              placeholder="請輸入20個字以內的商品名稱" 
              onChange={handleNameButton}
              className="col-span-3"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-left lg:text-2xl text-md">
              商品價格
            </Label>
            <Input id="amount" className="col-span-3"  onChange={handlePriceButton}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-left lg:text-2xl text-md">
              商品總數
            </Label>
            <Input id="quantity" className="col-span-3" onChange={handleQuantityButton}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-left lg:text-2xl text-md">
              商品單位
            </Label>
            <Input id="unit" className="col-span-3" onChange={handleUnitButton}/>
          </div>
          <CategorySelector handleIsOpen={handleSelector}/>
          <UploadRegion handleSendImg={setImgBase64} handleSendType={setFileType} handleSendError={setErrorMessage} selectorStatus={isSelectorOpen}/>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-left lg:text-2xl text-md">
              放置地點
            </Label>
            <div className="col-span-3">
              <Input
                id='location'
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                placeholder="搜尋地點"

              />
              {predictions.length > 0 && (
                <div className="col-span-3">
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
          </div>
          {location != 'empty' && (
            <div className="mt-2 text-sm text-gray-600">
              選擇的地點: {location}
            </div>
          )}
        </div>
        {errorMessage != '' && (
          <Alert className="bg-red-500 text-white">
            <AlertTitle>錯誤</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {isUploading && closeDialog != true && (
        <Alert className="text-center bg-yellow-100">
            <AlertDescription className=" text-black text-2xl">
              商品正在上傳中，請稍後...
            </AlertDescription>
          </Alert>
        )}
        {closeDialog != true && isUploading != true &&
        <DialogFooter className="items-center">
          <Button type="submit" className=" mt-5 lg:text-2xl text-lg w-1/2" onClick={handleConfirm} disabled={isSelectorOpen}>確認</Button>
        </DialogFooter>}
        {closeDialog &&
        <Alert className="bg-green-500 text-white">
          <AlertDescription>商品上傳成功，請關閉表單</AlertDescription>
        </Alert>}
        {closeDialog &&
        <DialogFooter className="items-center">
          <DialogClose asChild>
            <Button type="submit" className="lg:text-2xl text-lg w-1/2">關閉</Button>
          </DialogClose>     
        </DialogFooter>} 
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}




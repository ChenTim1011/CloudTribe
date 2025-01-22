'use client'
import React, { useEffect, useState, useRef } from "react"
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { NavigationBar } from'@/components/NavigationBar'
import ConsumerService from '@/services/consumer/consumer'
import UserService from '@/services/user/user'
import SellerService from '@/services/seller/seller'
import { User } from '@/interfaces/user/user';
import { CartItem } from '@/interfaces/tribe_resident/seller/seller';
import { PurchasedProductRequest } from '@/interfaces/consumer/consumer';
import { useRouter } from 'next/navigation'
import { useJsApiLoader, LoadScriptProps } from "@react-google-maps/api";
import Link from "next/link"
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
// Format prediction description
const formatPredictionDisplay = (prediction: google.maps.places.AutocompletePrediction) => {
  const businessName = prediction.structured_formatting.main_text;
  const address = prediction.structured_formatting.secondary_text;

  return {
    businessName: businessName || '',
    address: address || ''
  };
};

export default function ShoppingCart(){
  const [user, setUser] = useState<User>()
  const [cart, setCart] = useState<CartItem[]>([])
  const [changedQuantity, setChangedQuantity] = useState([])
  const [check, setCheck] = useState<string[]>([])
  const [message, setMessage] = useState('empty')
  const [location, setLocation] = useState<string>("empty");
  const [searchInput, setSearchInput] = useState<string>("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isManualInput, setIsManualInput] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter()
  
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

  useEffect(()=>{
    const _user = UserService.getLocalStorageUser()
    if(_user.name == 'empty'){
      router.replace('/login')
    }   
    setUser(_user)
    setChangedQuantity([])
    get_shopping_cart_items(_user.id)
  }, [router, message]) // Add 'router' to the dependency array
  
  const get_shopping_cart_items = async(userId: Number) => {
    try{
      const cart_items:CartItem[] = await ConsumerService.get_shopping_cart_items(userId)
      setCart(cart_items)
    }
    catch(e){
      console.log(e)
    }
  }
  const handleDeleteButton = (itemId: Number) => {
    try {
      const res = ConsumerService.delete_shopping_cart_item(itemId)
      setCart(cart.filter((item) => item.id != itemId))
    }
    catch(e){
      console.log(e)
    } 

  }
  const handleQuantityInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setChangedQuantity({...changedQuantity, [event.target.id.split('-')[1]]:event.target.value})
  }
  
  const storeChangedQuantity = async() => {
    for(var key in changedQuantity){
      try{
        const res = await ConsumerService.update_shopping_cart_quantity(parseInt(key), changedQuantity[key])
      }
      catch(e){
        console.log(e)
      }  
    }  
  }
  const handlePurchaseButton = async() =>{
    if(check.length == 0){
      setMessage('請勾選商品')
      setTimeout(() => setMessage('empty'), 2000)
    }
    else if(location=='empty'){
      setMessage('請先設定取貨地點')
      setTimeout(() => setMessage('empty'), 3500)
    }
    else{
      storeChangedQuantity()
      check.map(async(checkedItemId)=> {
        let item = cart.find((item) => item.id.toString() == checkedItemId)
        if(item != undefined && user != undefined){
          try{
            //const res_product = await SellerService.get_product_info(item?.id)
            let req: PurchasedProductRequest = {
              seller_id: item?.seller_id,
              buyer_id: user?.id,
              buyer_name: user?.name,
              produce_id: item?.produce_id,
              quantity: item?.quantity,
              starting_point: item?.location,
              end_point: location,
            }
            const res_order = await ConsumerService.add_product_order(req) 
            const res_cart_status = await ConsumerService.update_shopping_cart_status(item?.id)
          
          }
          catch(e){
            console.log(e)
          }
        }
      })
      setMessage('成功訂購商品')
      if(user != undefined)
        get_shopping_cart_items(user.id)
      setTimeout(() => setMessage('empty'), 2000)  
    }
  }
  const handleCheckBox: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const target = event.target as HTMLButtonElement
    const id = target.id.split('-')[1]
    if(check.includes(id))
      setCheck(check.filter((element) => element != id))
    else
      check.push(id)
  }
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

  return(
    <div>
      <NavigationBar/>
      {message != 'empty' && 
      <Alert className="bg-yellow-300 text-black w-fit text-center">
        <AlertDescription className="lg:text-lg text-md">
          {message}
        </AlertDescription>
      </Alert>}
      <div className="flex flex-row justify-between">
        <Button className="w-fit lg:m-8 m-4 px-4" onClick={storeChangedQuantity}>
          <Link href="/consumer">
            返回商品頁面
          </Link>
        </Button>
        
        
        <Button className="w-fit lg:m-8 m-4 px-4" onClick={handlePurchaseButton}>購買勾選商品</Button>
      </div>
      <div className="m-5">
        <label className="block text-lg font-medium text-gray-700">取貨地點</label>
        <div className="relative">
          <Input
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            placeholder="請輸入取貨地點"
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
        {location != 'empty' && (
          <div className="mt-2 text-sm text-gray-600">
            選擇的地點: {location}
          </div>
        )}
      </div>

      
      <div className="grid lg:grid-cols-3 grid-cols-1 items-center">
        {cart.map((item)=>
          <div key={item.id.toString()} className="flex flex-row w-full lg:h-[150px] h-[100px] items-center text-center space-x-2 p-4 lg:border-4">
            <div className="w-1/12">
              <Checkbox 
                id={`check-${item.id}`} 
                className="lg:h-6 lg:w-6"
                onClick={handleCheckBox}/>
            </div>
            <div className="w-3/12">
              <img
                src={item.img_url} 
                alt={item.name} 
   
                className="w-full py-2 lg:h-[145px] h-[95px]"
              />
            </div> 
            <div className="flex flex-col w-5/12 text-center">
              <p className="lg:text-2xl line-clamp-2 text-pretty">{item.name}</p>
              <p className="lg:text-lg text-red-600">${item.price.toString()} / {item.unit}</p>
              
            </div>
            <Input
              type="number" 
              id={`quantity-${item.id}`}
              className="w-2/12 text-center lg:h-8 lg:text-lg"
              defaultValue={item.quantity.toString()} 
              onChange={handleQuantityInput}
              min={1}/>
            <Button 
              variant="outline" 
              id={`delete-${item.id}`}
              className="bg-black text-white w-1/12"
              onClick={() => handleDeleteButton(item.id)}>
              <FontAwesomeIcon icon={faTrashAlt} className="text-white"/>
            </Button>
          </div>

        )}
      </div>
      
    </div>

  )
}
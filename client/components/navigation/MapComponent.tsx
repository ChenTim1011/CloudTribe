"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useState, useRef, useCallback } from "react";
import { LoadScript, GoogleMap, Autocomplete, Marker } from "@react-google-maps/api";
import Directions from "./Directions";
import { useSearchParams } from 'next/navigation';

interface Route {
  summary: string;
  legs: {
    start_address: string;
    end_address: string;
    distance: { text: string };
    duration: { text: string };
  }[];
}

const libraries = ["places", "directions"];

const MapComponent: React.FC = () => {
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [originName, setOriginName] = useState<string>("");
  const [destinationName, setDestinationName] = useState<string>("");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [center, setCenter] = useState<{ lat: number, lng: number }>({ lat: 24.987772543745507, lng: 121.57809269945467 });
  const [error, setError] = useState<string | null>(null);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const searchParams = useSearchParams();

  const autocompleteOriginRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDestinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = useCallback((autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>, setFn: React.Dispatch<React.SetStateAction<string>>, setNameFn: React.Dispatch<React.SetStateAction<string>>) => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        setFn(`${location.lat()},${location.lng()}`);
        const name = place.formatted_address?.replace(", Taiwan", "")?.replace(", 台灣", "") ?? "";
        setNameFn(name);
        setError(null);
      } else {
        setError("請用選取的方式找到目標位置，或是輸入有效的地址或地標名稱");
      }
    }
  }, []);

  const handleMoveMapToOrigin = useCallback(() => {
    if (autocompleteOriginRef.current) {
      const place = autocompleteOriginRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        setCenter({ lat: location.lat(), lng: location.lng() });
        setError(null);
      } else {
        setError("起點無效，請重新輸入");
        console.error("無效的名稱，請重新輸入", place);
      }
    }
  }, []);

  const handleMoveMapToDestination = useCallback(() => {
    if (autocompleteDestinationRef.current) {
      const place = autocompleteDestinationRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        setCenter({ lat: location.lat(), lng: location.lng() });
        setError(null);
      } else {
        setError("終點無效，請重新輸入");
        console.error("無效的名稱，請重新輸入", place);
      }
    }
  }, []);

  const handleGetCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOrigin(`${latitude},${longitude}`);
          setCenter({ lat: latitude, lng: longitude });
          setOriginName("目前位置");
          setError(null);
        },
        (error) => {
          console.error("Error getting location: ", error);
          setError("無法獲取當前位置，請確保瀏覽器允許位置存取");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setError("瀏覽器不支援地理位置功能");
    }
  }, []);

  const handleGenerateNavigationLink = useCallback(() => {
    if (!origin || !destination) {
      setError("請輸入有效的起點和終點");
      return;
    }

    const baseURL = 'https://www.google.com/maps/dir/';
    const url = `${baseURL}${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
    setNavigationUrl(url);
  }, [origin, destination]);

  const handleViewOrder = async () => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      setError("無效的訂單ID");
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      if (data.order_status !== '接單') {
        setError("只顯示狀態為接單的訂單");
        return;
      }
      setOrderData(data);
      setError(null);
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('無法獲取訂單資料，請重試');
    }
  };

  const handleCompleteOrder = async () => {
    if (!orderData || !orderData.id) return;

    try {
      const response = await fetch(`/api/orders/${orderData.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete order');
      }

      const updatedOrder = { ...orderData, order_status: '已完成訂單' };
      setOrderData(updatedOrder);
      alert('訂單已完成');
    } catch (error) {
      console.error('Error completing order:', error);
      alert('完成訂單失敗');
    }
  };

  const handleNavigateToLocation = () => {
    if (orderData && orderData.location) {
      const locationUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(orderData.location)}`;
      window.open(locationUrl, '_blank');
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string} libraries={libraries}>
      <div className="max-w-full mx-auto my-6 space-y-4">
        <div className="flex justify-center">
          <Button onClick={handleViewOrder} className="mt-2">查看表單</Button>
        </div>
        <div id="map" style={{ height: "60vh", width: "100%" }}>
          <GoogleMap
            center={center}
            zoom={14}
            mapContainerStyle={{ width: "100%", height: "100%" }}
          >
            {currentLocation && <Marker position={currentLocation} />}
            <Directions
              routes={routes}
              setRoutes={setRoutes}
              origin={origin}
              destination={destination}
              setTotalDistance={setTotalDistance}
              setTotalTime={setTotalTime}
            />
          </GoogleMap>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="bg-black text-white p-4 rounded-t-md">
         
          <Button onClick={handleNavigateToLocation}>目前位置到送貨地點的導覽連結</Button>
            <CardTitle className="text-lg font-bold">導航地圖</CardTitle>
            <CardDescription className="text-sm">顯示路線與地圖</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <h2 className="text-lg font-bold">設置起點和終點</h2>
              <div className="flex items-center space-x-2">
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocompleteOriginRef.current = autocomplete;
                  }}
                  onPlaceChanged={() => handlePlaceChanged(autocompleteOriginRef, setOrigin, setOriginName)}
                >
                  <Input type="text" placeholder="搜尋起點" />
                </Autocomplete>
                <Button onClick={handleMoveMapToOrigin}>移動地圖到起點</Button>
                <Button onClick={handleGetCurrentLocation}>以目前位置為起點</Button>
              </div>
              <div className="flex items-center space-x-2">
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocompleteDestinationRef.current = autocomplete;
                  }}
                  onPlaceChanged={() => handlePlaceChanged(autocompleteDestinationRef, setDestination, setDestinationName)}
                >
                  <Input type="text" placeholder="搜尋終點" />
                </Autocomplete>
                <Button onClick={handleMoveMapToDestination}>移動地圖到終點</Button>   
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>錯誤</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button onClick={handleGenerateNavigationLink} className="mt-2">生成導航連結</Button>
              {navigationUrl && (
                <p className="text-center mt-2">
                  <a href={navigationUrl} target="_blank" rel="noopener noreferrer">點此查看從 {originName} 到 {destinationName} 的導航路徑</a>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        {totalDistance && totalTime && (
          <Card className="shadow-lg">
            <CardFooter className="p-4 flex flex-col space-y-4">
              <div className="space-y-2">
                <p className="text-lg">總距離: {totalDistance}</p>
                <p className="text-lg">總時間: {totalTime}</p>
              </div>
            </CardFooter>
          </Card>
        )}

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full max-w-2xl max-h-[calc(100vh-200px)] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>訂單詳情</SheetTitle>
              <SheetClose />
            </SheetHeader>
            {orderData ? (
              <Card className="m-4 shadow-lg">
                <CardHeader className="bg-black text-white p-4 rounded-t-md">
                  <CardTitle className="text-lg font-bold">{orderData.order_type}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 font-bold">消費者姓名: {orderData.name}</p>
                    <p className="text-sm text-gray-700 font-bold">電話: {orderData.phone}</p>
                    <p className="text-sm text-gray-700 font-bold">最晚可接單日期: {orderData.date}</p>
                    <p className="text-sm text-gray-700 font-bold">最晚可接單時間: {orderData.time}</p>
                    <p className="text-sm text-gray-700 font-bold">地點: {orderData.location}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 font-bold">商品: </p>
                    <ul className="list-disc list-inside ml-4">
                      {orderData.items.map((item: any) => (
                        <li key={item.id} className="text-sm text-gray-700 mb-2">
                          <div className="flex items-center space-x-2">
                            <img src={item.img} alt={item.name} className="w-10 h-10 object-cover rounded" />
                            <div>
                              <span className="block font-semibold text-black truncate" style={{ maxWidth: '20rem' }}>
                                {item.name || '未命名'}
                              </span>
                              <span className="block">- {item.quantity} x ${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {orderData.note && (
                    <p className="text-sm text-gray-700 font-bold">備註: {orderData.note}</p>
                  )}
                  {orderData.previous_driver_name && (
                    <div className="mt-4">
                      <p className="text-sm text-black-600 font-bold">🔄轉單自: {orderData.previous_driver_name} ({orderData.previous_driver_phone})</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4">
                  <Button onClick={handleCompleteOrder} className="bg-black text-white">完成訂單</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="p-4">
                <p>正在加載訂單資料...</p>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </LoadScript>
  );
};

export default MapComponent;

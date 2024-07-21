"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { GoogleMap, Autocomplete, Marker, useJsApiLoader, LoadScriptProps } from "@react-google-maps/api";
import { useSearchParams } from 'next/navigation';
import Directions from "@/components/navigation/Directions";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";

interface Route {
  summary: string;
  legs: {
    start_address: string;
    end_address: string;
    distance: { text: string };
    duration: { text: string };
  }[];
}

const libraries: LoadScriptProps['libraries'] = ["places", "directions"];

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
  const [center, setCenter] = useState<{ lat: number, lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showDriverOrders, setShowDriverOrders] = useState(false);

  const searchParams = useSearchParams();
  const driverId = searchParams.get('driverId');  // Assuming driverId is passed as a URL parameter
  const orderId = searchParams.get('orderId');

  const autocompleteOriginRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDestinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'zh-TW', // 指定語言參數
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
          setOrigin(`${latitude},${longitude}`);
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

  useEffect(() => {
    if (orderId) {
      fetchOrderData(orderId);
    }
  }, [orderId]);

  const fetchOrderData = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order data');
      }
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching order data:', error);
      setError('無法獲取訂單資料');
    }
  };

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

  const handleViewOrder = () => {
    setShowDriverOrders(true);
    setIsSheetOpen(true);
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

  const handleNavigateOrder = (location: string) => {
    if (location) {
      const locationUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
      window.open(locationUrl, '_blank');
    }
  };

  if (loadError) {
    return <div>地圖加載失敗</div>;
  }

  if (!isLoaded) {
    return <div>正在加載地圖...</div>;
  }

  return (
    <div className="max-w-full mx-auto my-10 space-y-6">
      <div id="map" className="mb-6" style={{ height: "60vh", width: "100%" }}>
        <GoogleMap
          center={center!}
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
      <Card className="my-10 shadow-lg mb-6">   
        <CardHeader className="bg-black text-white p-4 rounded-t-md flex justify-between">
          <div>
            <CardTitle className="my-3 text-lg font-bold">導航地圖</CardTitle>
            <CardDescription className="my-3 text-white text-sm">顯示路線與地圖</CardDescription>
          </div>
          
        </CardHeader>
        <CardContent className="p-4">
        <Button onClick={handleViewOrder} className="bg-black text-white max-w-xs w-1/2 mx-auto block">查看表單</Button>
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-bold">起點</h2>
            <div className="flex items-center w-full">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteOriginRef.current = autocomplete;
                }}
                onPlaceChanged={() => handlePlaceChanged(autocompleteOriginRef, setOrigin, setOriginName)}
              >
                <div className="flex items-center w-full">
                  <Input type="text" placeholder="搜尋起點" className="w-full" />
                </div>
              </Autocomplete>
            </div>
            <Button onClick={handleMoveMapToOrigin}>移動地圖到起點</Button>
            <Button onClick={handleGetCurrentLocation}>以目前位置為起點</Button>
            <h2 className="text-lg font-bold">終點</h2>
            <div className="flex items-center w-full">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteDestinationRef.current = autocomplete;
                }}
                onPlaceChanged={() => handlePlaceChanged(autocompleteDestinationRef, setDestination, setDestinationName)}
              >
                <div className="flex items-center w-full">
                  <Input type="text" placeholder="搜尋終點" className="w-full" />
                </div>
              </Autocomplete>
            </div>
            <Button onClick={handleMoveMapToDestination}>移動地圖到終點</Button>
            {orderData && orderData.location && (
              <Button className="my-10 bg-black text-white" onClick={() => handleNavigateOrder(orderData.location)}>
                目前位置到送貨地點的導覽連結
              </Button>
            )}
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
        <Card className="shadow-lg mb-6">
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
          {showDriverOrders ? (
            <DriverOrdersPage driverData={{ id: driverId }} />
          ) : (
            <div className="p-4">
              <p>正在加載訂單資料...</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MapComponent;

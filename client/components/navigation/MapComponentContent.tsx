"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, Autocomplete, Marker, useJsApiLoader, LoadScriptProps } from "@react-google-maps/api";
import { useSearchParams } from 'next/navigation';
import Directions from "@/components/navigation/Directions";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";
import { MapComponentState } from "@/interfaces/navigation/MapComponentState";
import { LatLng } from "@/interfaces/navigation/LatLng";
import { Route } from "@/interfaces/navigation/Route";
import { Driver } from "@/interfaces/driver/Driver";

// 定義地圖的所需庫
const libraries: LoadScriptProps['libraries'] = ["places"];

const fetchCoordinates = async (placeName: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        placeName
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return location;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
  }
  return null;
};


const handlePlaceChanged = async (
  autocompleteRef: React.RefObject<google.maps.places.Autocomplete>,
  setFn: React.Dispatch<React.SetStateAction<string>>,
  setNameFn: React.Dispatch<React.SetStateAction<string>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  let error = null;
  if (autocompleteRef.current) {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry && place.geometry.location) {
      const location = place.geometry.location;
      setFn(`${location.lat()},${location.lng()}`);
      const name = place.name || "未知地點";
      setNameFn(name);
    } else if (place.name) {
      const location = await fetchCoordinates(place.name);
      if (location) {
        setFn(`${location.lat},${location.lng}`);
        setNameFn(place.name);
      } else {
        error = "無法找到該地點，請重新輸入或選取有效的地點名稱";
      }
    } else {
      error = "請用選取的方式找到目標位置，或是輸入有效的地址或地標名稱";
    }
  }
  setError(error);
};

const MapComponentContent: React.FC = () => {

  const searchParams = useSearchParams();
  const driverId = searchParams.get('driverId');
  const orderId = searchParams.get('orderId');

  // 定義狀態變數
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [originName, setOriginName] = useState<string>("");
  const [destinationName, setDestinationName] = useState<string>("");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIndex, setRouteIndex] = useState<number>(0); 
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showDriverOrders, setShowDriverOrders] = useState(false);
  const [driverData, setDriverData] = useState<Driver | null>(null);

  // 自動完成參考
  const autocompleteOriginRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDestinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  // 加載 Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'zh-TW',
  });

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

  const fetchDriverData = async (driverId: string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch driver data');
      }
      const data = await response.json();
      setDriverData(data);
    } catch (error) {
      console.error('Error fetching driver data:', error);
      setError('無法獲取司機資料');
    }
  };

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
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
  },[]);

  useEffect(() => {
    if (orderId) {
      fetchOrderData(orderId);
    }
  }, [orderId]);

  useEffect(() => {
    if (driverId) {
      fetchDriverData(driverId);
    }
  }, [driverId]);

  if (loadError) return <div>地圖加載失敗</div>;
  if (!isLoaded) return <div>正在加載地圖...</div>;


  const handleMoveMapToOrigin = () => {
    if (autocompleteOriginRef.current) {
      const place = autocompleteOriginRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        setCenter({ lat: location.lat(), lng: location.lng() });
        setError(null);
      } else {
        setError("起點無效，請重新輸入");
      }
    }
  };

  const handleMoveMapToDestination = () => {
    if (autocompleteDestinationRef.current) {
      const place = autocompleteDestinationRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        setCenter({ lat: location.lat(), lng: location.lng() });
        setError(null);
      } else {
        setError("終點無效，請重新輸入");
      }
    }
  };

// 使用目前位置到訂單地點的導航連結
const handleGenerateNavigationLinkFromCurrentLocation = () => {
  if (!currentLocation) {
    setError("無法生成導航連結，目前位置無法取得，請手動輸入起點終點");
    return;
  }

  if (!orderData || !orderData.location) {
    setError("無法生成導航連結，請確認訂單地點是否有效");
    return;
  }

  const baseURL = 'https://www.google.com/maps/dir/';
  const origin = `${currentLocation.lat},${currentLocation.lng}`;
  const destination = orderData.location;
  const url = `${baseURL}${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
  
  setNavigationUrl(url);
  setOriginName("目前位置");
  setDestinationName(orderData.location); // 假設 orderData.location 是可以顯示的地點名稱
  setError(null);
};

// 使用手動輸入的起點和終點生成導航連結
const handleGenerateNavigationLinkFromInput = () => {
  if (!origin || !destination) {
    setError("請輸入有效的起點和終點");
    return null;
  }

  const baseURL = 'https://www.google.com/maps/dir/';
  const url = `${baseURL}${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
  
  setNavigationUrl(url);
  setError(null);
  return url;
};

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
      const updatedOrder = { ...orderData, order_status: '已完成' };
      setOrderData(updatedOrder);
      alert('訂單已完成');
    } catch (error) {
      console.error('Error completing order:', error);
      alert('完成訂單失敗');
    }
  };

    // Handler for manual search button
    const handleManualSearch = async (placeName: string, setFn: React.Dispatch<React.SetStateAction<string>>, setNameFn: React.Dispatch<React.SetStateAction<string>>) => {
      const location = await fetchCoordinates(placeName);
      if (location) {
        setFn(`${location.lat},${location.lng}`);
        setNameFn(placeName);
        setError(null);
      } else {
        setError("無法找到該地點，請重新輸入或選取有效的地點名稱");
      }
    };

    const handleClearOrigin = () => {
      setOrigin("");
      setOriginName("");
    };
  
    const handleClearDestination = () => {
      setDestination("");
      setDestinationName("");
    };

  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <div className="max-w-full mx-auto space-y-6">
        <div className="w-full flex justify-start p-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            上一頁
          </Button>
        </div>

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
            <Button onClick={handleViewOrder} className="my-5 bg-black text-white max-w-xs w-1/2 mx-auto block">查看表單</Button>
            {orderData && orderData.location && (
              <Button className="my-5 bg-black text-white max-w-xs w-1/2 mx-auto block" onClick={handleGenerateNavigationLinkFromCurrentLocation}>
                目前位置到送貨地點的導覽連結
              </Button>
            )}
            {error && (
                <Alert variant="destructive">
                  <AlertTitle>錯誤</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            <div className="flex flex-col space-y-4">
              <h2 className="my-5 text-lg font-bold">起點(必須選擇選項)</h2>
              <div className="flex mb-4 w-full">
                <Autocomplete
                  onLoad={(autocomplete) => { autocompleteOriginRef.current = autocomplete; }}
                  onPlaceChanged={() => handlePlaceChanged(autocompleteOriginRef, setOrigin, setOriginName, setError)}
                  options={{
                    types: ['establishment'], // request only business locations
                    fields: ['name', 'geometry'], // return only name and geometry
                  }}
                >
                  <Input
                    type="text"
                    placeholder="搜尋起點"
                    className="w-full"
                    value={originName}
                    onChange={(e) => setOriginName(e.target.value)}
                  />
                </Autocomplete>
                <Button onClick={handleClearOrigin} className="ml-2">
                    清空
                  </Button>
              </div>
              <Button onClick={handleMoveMapToOrigin}>移動地圖到起點</Button>
              <h2 className="text-lg font-bold">終點(必須選擇選項)</h2>
              <div className="flex items-center w-full">
                <Autocomplete
                  onLoad={(autocomplete) => { autocompleteDestinationRef.current = autocomplete; }}
                  onPlaceChanged={() => handlePlaceChanged(autocompleteDestinationRef, setDestination, setDestinationName, setError)}
                >
                <Input
                  type="text"
                  placeholder="搜尋終點"
                  className="w-full"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                />
                </Autocomplete>
                <Button onClick={handleClearDestination} className="ml-2">
                  清空
                </Button>
              </div>
              <Button onClick={handleMoveMapToDestination}>移動地圖到終點</Button>

              <Button
                onClick={() => {
                  const url = handleGenerateNavigationLinkFromInput();  // 生成導航連結
                  if (url){
                    window.open(url,'_blank');
                  }
                }}
                className="mt-2"
              >
                生成自訂起點和終點的導航連結
              </Button>
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
                driverData ? (
                  <DriverOrdersPage driverData={driverData} />
                ) : (
                  <div className="p-4">
                    <p>正在加載司機資料...</p>
                  </div>
                )
              ) : (
                <div className="p-4">
                  <p>正在加載訂單資料...</p>
                </div>
              )}
          </SheetContent>
        </Sheet>
      </div>
    </Suspense>
  );
  
};

export default MapComponentContent;

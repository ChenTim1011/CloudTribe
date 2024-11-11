// components/navigation/MapComponentContent.tsx

"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
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
import { LatLng } from "@/interfaces/navigation/LatLng";
import { Route } from "@/interfaces/navigation/Route";
import { Driver } from "@/interfaces/driver/Driver";

// Define the libraries to load
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

  // Define state
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [originName, setOriginName] = useState<string>("");
  const [destinationName, setDestinationName] = useState<string>("");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showDriverOrders, setShowDriverOrders] = useState(false);
  const [driverData, setDriverData] = useState<Driver | null>(null);

  // Autocomplete refs
  const autocompleteOriginRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDestinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Map ref
  const mapRef = useRef<google.maps.Map | null>(null);

  // Google Maps API
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
      console.log("Fetched Order Data:", data); // 添加日誌
      setOrderData(data);
      // If location is an object with lat and lng, set destination to "lat,lng"
      if (data.location && typeof data.location === 'object' && 'lat' in data.location && 'lng' in data.location) {
        setDestination(`${data.location.lat},${data.location.lng}`);
        setDestinationName("送貨地點");
      } else if (data.location && typeof data.location === 'string') {
        setDestination(data.location);
        setDestinationName(data.location);
      }
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
      console.log("Fetched Driver Data:", data); // 添加日誌
      setDriverData(data);
    } catch (error) {
      console.error('Error fetching driver data:', error);
      setError('無法獲取司機資料');
    }
  };

  // Get current location
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc: LatLng = { lat: latitude, lng: longitude };
          setCenter(loc);
          setCurrentLocation(loc);
          setOrigin(`${latitude},${longitude}`);
          setOriginName("目前位置");
          setError(null);
        },
        (error) => {
          console.error("Error getting location: ", error);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setError("使用者拒絕提供位置資訊。");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("位置資訊不可用。");
              break;
            case error.TIMEOUT:
              setError("取得位置資訊超時。");
              break;
            default:
              setError("無法獲取當前位置，請確保瀏覽器允許位置存取。");
              break;
          }
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setError("瀏覽器不支援地理位置功能");
    }
  }, []);

  // Fetch order data
  useEffect(() => {
    if (orderId) {
      fetchOrderData(orderId);
    }
  }, [orderId]);

  // Fetch driver data
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
        const loc: LatLng = { lat: location.lat(), lng: location.lng() };
        setCenter(loc);
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
        const loc: LatLng = { lat: location.lat(), lng: location.lng() };
        setCenter(loc);
        setError(null);
      } else {
        setError("終點無效，請重新輸入");
      }
    }
  };

  // Generate navigation link from current location to order location
  const handleGenerateNavigationLinkFromCurrentLocation = () => {
    if (!currentLocation) {
      setError("無法生成導航連結，目前位置無法取得，請手動輸入起點終點");
      console.log("Current location is null");
      return;
    }

    if (!orderData || !orderData.location) {
      setError("無法生成導航連結，請確認訂單地點是否有效");
      console.log("Order data or location is invalid");
      return;
    }

    let destination = orderData.location;
    // 如果 location 是對象，轉換為 "lat,lng" 字符串
    if (typeof orderData.location === 'object' && 'lat' in orderData.location && 'lng' in orderData.location) {
      destination = `${orderData.location.lat},${orderData.location.lng}`;
    }

    console.log("Origin:", `${currentLocation.lat},${currentLocation.lng}`);
    console.log("Destination:", destination);

    const baseURL = 'https://www.google.com/maps/dir/';
    const url = `${baseURL}${encodeURIComponent(`${currentLocation.lat},${currentLocation.lng}`)}/${encodeURIComponent(destination)}`;
    
    setNavigationUrl(url);
    setOriginName("目前位置");
    setDestinationName(destination); 
    setError(null);
  };

  // From user input origin and destination, generate navigation link
  const handleGenerateNavigationLinkFromInput = () => {
    if (!origin || !destination) {
      setError("請輸入有效的起點和終點");
      console.log("Origin or destination is missing");
      return null;
    }

    console.log("Generating navigation link with Origin:", origin, "Destination:", destination);

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
            onLoad={(map) => { mapRef.current = map; }}
            center={center!}
            zoom={14}
            mapContainerStyle={{ width: "100%", height: "100%" }}
          >
            {currentLocation && <Marker position={currentLocation} />}
            {destination && (
              <Marker
                position={{
                  lat: parseFloat(destination.split(",")[0]),
                  lng: parseFloat(destination.split(",")[1]),
                }}
                label="終點"
              />
            )}
            <Directions
              map={mapRef.current} 
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
                  const url = handleGenerateNavigationLinkFromInput();  
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

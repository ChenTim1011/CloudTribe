// components/navigation/MapComponentContent.tsx

"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowUp, faArrowDown, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  GoogleMap,
  Autocomplete,
  Marker,
  useJsApiLoader,
  LoadScriptProps,
} from "@react-google-maps/api";
import { useSearchParams } from "next/navigation";
import Directions from "@/components/navigation/Directions";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";
import { LatLng } from "@/interfaces/navigation/LatLng";
import { Route } from "@/interfaces/navigation/Route";
import { Driver } from "@/interfaces/driver/Driver";
import { Order } from "@/interfaces/order/Order";

const libraries: LoadScriptProps["libraries"] = ["places"];

// Function to fetch coordinates based on place name
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

const MapComponentContent: React.FC = () => {
  const searchParams = useSearchParams();
  const driverId = searchParams.get("driverId");
  const orderId = searchParams.get("orderId");

  // Define state
  const [origin, setOrigin] = useState<string>("");
  const [originName, setOriginName] = useState<string>("");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showDriverOrders, setShowDriverOrders] = useState(false);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [destinations, setDestinations] = useState<{ name: string; location: string }[]>([]);
  const [newDestinationName, setNewDestinationName] = useState<string>("");
  const [newDestinationLocation, setNewDestinationLocation] = useState<string>("");

  // Autocomplete refs
  const autocompleteOriginRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteNewDestinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Map ref
  const mapRef = useRef<google.maps.Map | null>(null);

  // Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: "zh-TW",
  });

  // Function to fetch order data
  const fetchOrderData = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order data");
      }
      const data: Order = await response.json();
      console.log("Fetched Order Data:", data);
      setOrderData(data);

      // Extract destinations from order items and filter out empty locations
      const extractedDestinations = data.items
        .map((item) => item.location)
        .filter((loc): loc is string => loc !== undefined && loc.trim() !== "")
        .map((loc) => ({ name: loc, location: loc })); 

      // Remove duplicate destinations
      const uniqueDestinationsMap = new Map<string, { name: string; location: string }>();
      extractedDestinations.forEach((dest) => {
        const locKey = dest.location.toLowerCase();
        if (!uniqueDestinationsMap.has(locKey)) {
          uniqueDestinationsMap.set(locKey, dest);
        }
      });
      const uniqueDestinations = Array.from(uniqueDestinationsMap.values());

      setDestinations(uniqueDestinations);
    } catch (error) {
      console.error("Error fetching order data:", error);
      setError("無法獲取訂單資料");
    }
  };

  // Function to fetch driver data
  const fetchDriverData = async (driverId: string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch driver data");
      }
      const data = await response.json();
      console.log("Fetched Driver Data:", data);
      setDriverData(data);
    } catch (error) {
      console.error("Error fetching driver data:", error);
      setError("無法獲取司機資料");
    }
  };

  // Get current location
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
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
          switch (error.code) {
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

  // Function to handle place changes in Autocomplete
  const handlePlaceChanged = async (
    autocompleteRef: React.RefObject<google.maps.places.Autocomplete>,
    setFn: React.Dispatch<React.SetStateAction<string>>,
    setNameFn: React.Dispatch<React.SetStateAction<string>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setNewDestinationFn?: React.Dispatch<React.SetStateAction<string>>,
    setNewDestinationNameFn?: React.Dispatch<React.SetStateAction<string>>
  ) => {
    let errorMsg = null;
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        const loc = `${location.lat()},${location.lng()}`;
        setFn(loc);
        const name = place.name || "未知地點";
        setNameFn(name);
        if (setNewDestinationFn && setNewDestinationNameFn) {
          setNewDestinationFn(loc);
          setNewDestinationNameFn(name);
        }
      } else if (place.name) {
        const location = await fetchCoordinates(place.name);
        if (location) {
          const loc = `${location.lat},${location.lng}`;
          setFn(loc);
          setNameFn(place.name);
          if (setNewDestinationFn && setNewDestinationNameFn) {
            setNewDestinationFn(loc);
            setNewDestinationNameFn(place.name);
          }
        } else {
          errorMsg = "無法找到該地點，請重新輸入或選取有效的地點名稱";
        }
      } else {
        errorMsg = "請用選取的方式找到目標位置，或是輸入有效的地址或地標名稱";
      }
    }
    setError(errorMsg);
  };

  // Function to move the map to the origin
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

  // Function to generate navigation link from current location to the last destination
  const handleGenerateNavigationLinkFromCurrentLocation = () => {
    if (!currentLocation) {
      setError("無法生成導航連結，目前位置無法取得，請手動輸入起點終點");
      return;
    }

    if (destinations.length === 0) {
      setError("請至少添加一個目的地");
      return;
    }

    const origin = `${currentLocation.lat},${currentLocation.lng}`;
    const destination = destinations[destinations.length - 1].location;

    // Extract waypoints and remove duplicates
    const waypointsArray = destinations.slice(0, -1).map(dest => dest.location);
    const uniqueWaypointsSet = new Set<string>(waypointsArray.map(loc => loc.toLowerCase()));

    // Ensure destination is not included in waypoints
    uniqueWaypointsSet.delete(destination.toLowerCase());

    // retrieve unique waypoints
    const uniqueWaypoints = Array.from(uniqueWaypointsSet)
      .map(loc => destinations.find(dest => dest.location.toLowerCase() === loc)?.location || loc) // 保留原始格式
      .join('|');

    // Generate navigation URL
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}`;

    if (uniqueWaypoints) {
      url += `&waypoints=${encodeURIComponent(uniqueWaypoints)}`;
    }

    setNavigationUrl(url);
    setError(null);

    window.open(url, "_blank");
  };

  // Function to handle moving a destination up
  const handleMoveUp = (index: number) => {
    if (index === 0) return; 
    const newDestinations = Array.from(destinations);
    [newDestinations[index - 1], newDestinations[index]] = [newDestinations[index], newDestinations[index - 1]];
    setDestinations(newDestinations);
  };

  // Function to handle moving a destination down
  const handleMoveDown = (index: number) => {
    if (index === destinations.length - 1) return; 
    const newDestinations = Array.from(destinations);
    [newDestinations[index + 1], newDestinations[index]] = [newDestinations[index], newDestinations[index + 1]];
    setDestinations(newDestinations);
  };

  // Function to view order details
  const handleViewOrder = () => {
    setShowDriverOrders(true);
    setIsSheetOpen(true);
  };

  // Function to clear origin
  const handleClearOrigin = () => {
    setOrigin("");
    setOriginName("");
  };


  // Function to remove a specific destination
  const handleRemoveDestination = (index: number) => {
    const updated = Array.from(destinations);
    updated.splice(index, 1);
    setDestinations(updated);
  };

  // Function to add a new destination
  const handleAddDestination = () => {
    if (!newDestinationName || !newDestinationLocation) {
      setError("請輸入有效的地點名稱");
      return;
    }

    // Check for duplicate destinations
    const isDuplicate = destinations.some(
      (dest) => dest.location.toLowerCase() === newDestinationLocation.toLowerCase()
    );

    if (isDuplicate) {
      setError("該地點已經存在，請選擇另一個地點。");
      return;
    }

    setDestinations([
      ...destinations,
      { name: newDestinationName, location: newDestinationLocation },
    ]);
    setNewDestinationName("");
    setNewDestinationLocation("");
    setError(null);
  };

  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <div className="max-w-full mx-auto space-y-6">
        {/* Back Button */}
        <div className="w-full flex justify-start p-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            上一頁
          </Button>
        </div>

        {/* Google Map */}
        <div id="map" className="mb-6" style={{ height: "60vh", width: "100%" }}>
          <GoogleMap
            onLoad={(map) => {
              mapRef.current = map;
            }}
            center={center!}
            zoom={14}
            mapContainerStyle={{ width: "100%", height: "100%" }}
          >
            {/* Current Location Marker */}
            {currentLocation && <Marker position={currentLocation} label="起點" />}

            {/* Destination Markers */}
            {destinations.map((dest, index) => (
              <Marker
                key={`dest-${index}`} 
                position={{
                  lat: parseFloat(dest.location.split(",")[0]),
                  lng: parseFloat(dest.location.split(",")[1]),
                }}
                label={`終點${index + 1}`}
              />
            ))}

            {/* Directions Renderer */}
            <Directions
              map={mapRef.current}
              origin={origin}
              destinations={destinations}
              routes={routes}
              setRoutes={setRoutes}
              setTotalDistance={setTotalDistance}
              setTotalTime={setTotalTime}
            />
          </GoogleMap>
        </div>

        {/* Navigation Card */}
        <Card className="my-10 shadow-lg mb-6">
          <CardHeader className="bg-black text-white p-4 rounded-t-md flex justify-between">
            <div>
              <CardTitle className="my-3 text-lg font-bold">導航地圖</CardTitle>
              <CardDescription className="my-3 text-white text-sm">顯示路線與地圖</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* View Order Button */}
            <Button
              onClick={handleViewOrder}
              className="my-5 bg-black text-white max-w-xs w-1/2 mx-auto block"
            >
              查看表單
            </Button>

            {/* Total Distance and Time */}
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

            {/* Destinations List with Move Buttons */}
            <div className="my-5">
              <h2 className="text-lg font-bold mb-2">訂單地點</h2>
              <ul className="space-y-2">
                {destinations.map((dest, index) => (
                  <li
                    key={`dest-${index}`} 
                    className="p-2 border rounded-md bg-gray-100 flex justify-between items-center"
                  >
                    <span>{dest.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        variant="ghost"
                        className="p-1"
                        title="上移"
                      >
                        <FontAwesomeIcon icon={faArrowUp} />
                      </Button>
                      <Button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === destinations.length - 1}
                        variant="ghost"
                        className="p-1"
                        title="下移"
                      >
                        <FontAwesomeIcon icon={faArrowDown} />
                      </Button>
                      <Button
                        onClick={() => handleRemoveDestination(index)}
                        variant="ghost"
                        className="p-1 text-red-500"
                        title="移除"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add New Destination */}
            <div className="flex items-center space-x-2 justify-center">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteNewDestinationRef.current = autocomplete;
                }}
                onPlaceChanged={() =>
                  handlePlaceChanged(
                    autocompleteNewDestinationRef,
                    setNewDestinationLocation,
                    setNewDestinationName,
                    setError,
                    setNewDestinationLocation,
                    setNewDestinationName
                  )
                }
              >
                <Input
                  type="text"
                  placeholder="新增目的地"
                  className="w-full"
                  value={newDestinationName}
                  onChange={(e) => setNewDestinationName(e.target.value)}
                />
              </Autocomplete>
              <Button onClick={handleAddDestination}>新增</Button>
            </div>

            {/* Generate Navigation Link Button */}
            <Button
              onClick={handleGenerateNavigationLinkFromCurrentLocation}
              className="my-5 bg-black text-white max-w-xs w-1/2 mx-auto block"
            >
              生成導航連結
            </Button>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>錯誤</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>



        {/* Sheet for Order Details */}
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

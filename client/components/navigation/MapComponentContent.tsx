// MapComponentContent.tsx

"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
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
import {
  faArrowLeft,
  faArrowUp,
  faArrowDown,
  faTrash,
  faWalking,   
  faBicycle,  
  faCar,
  faThumbsUp, 
} from "@fortawesome/free-solid-svg-icons";
import {
  GoogleMap,
  Autocomplete,
  Marker,
  useJsApiLoader,
  LoadScriptProps,
} from "@react-google-maps/api";
import { useSearchParams, useRouter } from "next/navigation";
import Directions from "@/components/navigation/Directions";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";
import { LatLng } from "@/interfaces/navigation/navigation";
import { Route } from "@/interfaces/navigation/navigation"; 
import { Leg } from "@/interfaces/navigation/navigation";
import { Driver } from "@/interfaces/driver/driver";
import { Order } from "@/interfaces/tribe_resident/buyer/order";
import { DriverOrder } from "@/interfaces/driver/driver";
import DriverService  from '@/services/driver/driver';

// Define libraries for Google Maps
const libraries: LoadScriptProps["libraries"] = ["places"];

// Helper function to calculate distance between two LatLng points in meters
const getDistanceInMeters = (loc1: LatLng, loc2: LatLng): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRadians(loc1.lat);
  const φ2 = toRadians(loc2.lat);
  const Δφ = toRadians(loc2.lat - loc1.lat);
  const Δλ = toRadians(loc2.lng - loc1.lng);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return distance;
};

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
  console.log("MapComponentContent render");

  const searchParams = useSearchParams();
  const driverIdParam = searchParams.get("driverId");
  const orderId = searchParams.get("orderId");

  // Define state
  const [origin, setOrigin] = useState<string>("");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [legs, setLegs] = useState<Leg[]>([]); 
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showDriverOrders, setShowDriverOrders] = useState(false);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [travelMode, setTravelMode] = useState<string>("DRIVING"); // Changed to string
  const [optimizeWaypoints, setOptimizeWaypoints] = useState<boolean>(false);


  const [destinations, setDestinations] = useState<
    { name: string; location: LatLng }[]
  >([]);
  const [newDestinationName, setNewDestinationName] = useState<string>("");
  const [newDestinationLocation, setNewDestinationLocation] =
    useState<string>("");

  // Autocomplete refs
  const autocompleteNewDestinationRef = useRef<
    google.maps.places.Autocomplete | null
  >(null);

  // Map ref
  const mapRef = useRef<google.maps.Map | null>(null);

  // Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: "zh-TW",
  });

  const router = useRouter(); // Initialize router

  // Ref to store the last position
  const lastPositionRef = useRef<LatLng | null>(null);

  // Ref for throttling updates
  const isThrottledRef = useRef(false);

  // Format location to fixed decimal places
  const formatLocation = (lat: number, lng: number) => {
    return `${lat.toFixed(6)},${lng.toFixed(6)}`;
  };

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
      const uniqueDestinationsMap = new Map<
        string,
        { name: string; location: string }
      >();
      extractedDestinations.forEach((dest) => {
        const locKey = dest.location.toLowerCase();
        if (!uniqueDestinationsMap.has(locKey)) {
          uniqueDestinationsMap.set(locKey, dest);
        }
      });
      const uniqueDestinations = Array.from(uniqueDestinationsMap.values());

      // Add the order terminal location if it is not empty
      if (data.location && data.location.trim() !== "") {
        uniqueDestinations.push({ name: data.location, location: data.location });
      }

      // Geocode the destinations
      const destinationsWithCoords = await Promise.all(
        uniqueDestinations.map(async (dest) => {
          const coords = await fetchCoordinates(dest.location);
          if (coords) {
            return { name: dest.name, location: coords };
          }
          return null;
        })
      );

      // Filter out null destinations
      const validDestinations = destinationsWithCoords.filter(
        (dest): dest is { name: string; location: LatLng } => dest !== null
      );

      setDestinations(validDestinations);
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
      const data: Driver = await response.json();
      console.log("Fetched Driver Data:", data);
      setDriverData(data);
    } catch (error) {
      console.error("Error fetching driver data:", error);
      setError("無法獲取司機資料");
    }
  };

  // Travel Mode Mapping 定義
  const travelModeMapping: { [key: string]: string } = {
    DRIVING: "driving",
    WALKING: "walking",
    BICYCLING: "bicycling",
    TRANSIT: "transit",
  };

  // 記憶化路點
  const memoizedWaypoints = useMemo(() => {
    console.log("useMemo: memoizedWaypoints");
    return destinations.slice(0, -1).map(dest => ({
      location: dest.location,
      stopover: true,
    }));
  }, [destinations]);

  // Set map center when currentLocation updates
  useEffect(() => {
    if (currentLocation) {
      setCenter(currentLocation);
    }
  }, [currentLocation]);

  // Get current location and watch for changes
  useEffect(() => {
    console.log("useEffect: watchPosition");
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (isThrottledRef.current) return;

          const { latitude, longitude } = position.coords;
          const newLoc: LatLng = { lat: latitude, lng: longitude };

          // Calculate distance from last position
          if (
            !lastPositionRef.current ||
            getDistanceInMeters(newLoc, lastPositionRef.current) > 100 
          ) {
            setCurrentLocation(newLoc);
            setOrigin(formatLocation(newLoc.lat, newLoc.lng));
            setError(null);

            // Update last position
            lastPositionRef.current = newLoc;

            // Throttle updates
            isThrottledRef.current = true;
            setTimeout(() => {
              isThrottledRef.current = false;
            }, 5000); 
          }
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
        },
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.error("Geolocation is not supported by this browser.");
      setError("瀏覽器不支援地理位置功能");
    }
  }, []);

  // Fetch order data
  useEffect(() => {
    console.log("useEffect: fetchOrderData");
    if (orderId) {
      fetchOrderData(orderId);
    }
  }, [orderId]);

  // Fetch driver data
  useEffect(() => {
    console.log("useEffect: fetchDriverData");
    if (driverIdParam) {
      fetchDriverData(driverIdParam);
    }
  }, [driverIdParam]);

  // Extract legs from routes
  useEffect(() => {
    if (routes.length > 0 && routes[0].legs) {
      setLegs(routes[0].legs);
    } else {
      setLegs([]);
    }
  }, [routes]);

  // Handle early returns based on loading state
  if (loadError) {
    return <div>地圖加載失敗</div>;
  }

  if (!isLoaded) {
    return <div>正在加載地圖...</div>;
  }

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
        errorMsg =
          "請用選取的方式找到目標位置，或是輸入有效的地址或地標名稱";
      }
    }
    setError(errorMsg);
  };

  // Function to generate navigation link from current location to the last destination
  const handleGenerateNavigationLinkFromCurrentLocation = () => {
    if (!currentLocation) {
      setError("無法生成導航連結，目前位置無法取得，請手動輸入起點終點");
      return;
    }

    if (destinations.length === 0) {
      setError("請至少增加一個目的地");
      return;
    }

    const origin = `${currentLocation.lat},${currentLocation.lng}`;
    const finalDestination = destinations[destinations.length - 1].location;

    // Extract waypoints and remove duplicates
    const waypointsArray = destinations.slice(0, -1).map((dest) => dest.location);
    const uniqueWaypointsSet = new Set<string>(
      waypointsArray.map((loc) => `${loc.lat},${loc.lng}`.toLowerCase())
    );

    // Retrieve unique waypoints
    const uniqueWaypoints = Array.from(uniqueWaypointsSet)
      .map(
        (loc) =>
          waypointsArray.find(
            (dest) => `${dest.lat},${dest.lng}`.toLowerCase() === loc
          )
      )
      .filter((loc): loc is LatLng => loc !== undefined)
      .map((loc) => `${loc.lat},${loc.lng}`)
      .join("|");

    // Mapping of travel modes
    const travelModeString = travelModeMapping[travelMode] || "driving";
    
    // Generate navigation URL
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(`${finalDestination.lat},${finalDestination.lng}`)}`;

    if (uniqueWaypoints) {
      url += `&waypoints=${encodeURIComponent(uniqueWaypoints)}`;
    }

    // Add travelMode   
    url += `&travelmode=${travelModeString}`;

    setNavigationUrl(url);
    setError(null);

    window.open(url, "_blank");
  };

  // Function to handle moving a destination up
  const handleMoveUp = (index: number) => {
    if (index === 0 || index === destinations.length - 1) return;
    const newDestinations = Array.from(destinations);
    [newDestinations[index - 1], newDestinations[index]] = [
      newDestinations[index],
      newDestinations[index - 1],
    ];
    setDestinations(newDestinations);
  };

  // Function to handle moving a destination down
  const handleMoveDown = (index: number) => {
    if (index >= destinations.length - 2) return;
    const newDestinations = Array.from(destinations);
    [newDestinations[index + 1], newDestinations[index]] = [
      newDestinations[index],
      newDestinations[index + 1],
    ];
    setDestinations(newDestinations);
  };

  // Function to view order details
  const handleViewOrder = () => {
    setShowDriverOrders(true);
    setIsSheetOpen(true);
  };

  // Function to remove a specific destination
  const handleRemoveDestination = (index: number) => {
    if (index === destinations.length - 1) {
      setError("無法移除終點站");
      return;
    }

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
    const [lat, lng] = newDestinationLocation.split(",").map(Number);
    const newLatLng: LatLng = { lat, lng };

    const isDuplicate = destinations.some(
      (dest) =>
        dest.location.lat === newLatLng.lat &&
        dest.location.lng === newLatLng.lng
    );

    if (isDuplicate) {
      setError("該地點已經存在，請選擇另一個地點。");
      return;
    }

    const updatedDestinations = [...destinations];
    if (updatedDestinations.length > 0) {
      updatedDestinations.splice(updatedDestinations.length - 1, 0, {
        name: newDestinationName,
        location: newLatLng,
      });
    } else {
      updatedDestinations.push({ name: newDestinationName, location: newLatLng });
    }

    setDestinations(updatedDestinations);
    setNewDestinationName("");
    setNewDestinationLocation("");
    setError(null);
  };

  // Define handler functions for DriverOrdersPage
  const handleAcceptOrder = async (orderId: string, service: string) => {
    console.log("handleAcceptOrder called with driverId:", driverData?.id);
    console.log("Accepting order with orderId:", orderId);
    if (!driverData || !driverData.id) {
        console.error("Driver data is missing or incomplete");
        return;
    }
    try {
        const timestamp = new Date().toISOString();
        const acceptOrder: DriverOrder = {
            driver_id: driverData.id,
            order_id: parseInt(orderId),  
            action: "接單",
            timestamp: timestamp,
            previous_driver_id: undefined,
            previous_driver_name: undefined,
            previous_driver_phone: undefined,
            service: service
        }
        await  DriverService.handle_accept_order(service, parseInt(orderId), acceptOrder)
        alert('接單成功');

    } catch (error) {
        console.error('Error accepting order:', error);
        alert('接單失敗');
    }
};

/**
 * Handle transferring an order.
 * @param orderId - The ID of the order to transfer.
 * @param newDriverPhone - The phone number of the new driver.
 */
const handleTransferOrder = async (orderId: string, newDriverPhone: string) => {
    try {
        const response = await fetch(`/api/orders/${orderId}/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ current_driver_id: driverData?.id, new_driver_phone: newDriverPhone }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to transfer order: ${errorText}`);
        }

        alert('轉單成功，重整頁面可看到更新結果');

    } catch (error) {


        console.error('Error transferring order:', error);
        alert('轉單失敗');
    }
};

/**
 * Handle navigating to order details.
 * @param orderId - The ID of the order to navigate to.
 * @param driverId - The driver's ID.
 */
const handleNavigate = (orderId: string, driverId: number) => {
    console.log("Navigating to order with driverId:", driverId);
    router.push(`/navigation?orderId=${orderId}&driverId=${driverId}`);
};

/**
 * Handle completing an order.
 * @param orderId - The ID of the order to complete.
 */
const handleCompleteOrder = async (orderId: string, service: string) => {
    try {
        console.log('service=', service)
        const response = await fetch(`/api/orders/${service}/${orderId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to complete order');
        }

        alert('訂單已完成');
        
    } catch (error) {
        console.error('Error completing order:', error);
        alert('完成訂單失敗');
    }
};


// Function to recommend route by optimizing waypoints
const handleRecommendRoute = () => {
  if (destinations.length <= 2) {
    setError("至少需要兩個目的地才能推薦路徑。");
    return;
  }
  setOptimizeWaypoints(true);
};

// Callback to handle optimized waypoint order
const handleWaypointsOptimized = (waypointOrder: number[]) => {
  // waypointOrder is optimized order of waypoints
  // origin and terminal are fixed
  // reorder destinations based on waypointOrder
  const optimizedWaypoints = waypointOrder.map((index) => destinations[index]);

  // Get terminal destination
  const terminal = destinations[destinations.length - 1];

  // Update order of waypoint：origin -> optimizedWaypoints -> terminal
  setDestinations([...optimizedWaypoints, terminal]);

  // reset optimizeWaypoints to false
  setOptimizeWaypoints(false);
};


  return (
    <Suspense fallback={<div>正在加載地圖...</div>}>
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
            {currentLocation && <Marker position={currentLocation} label="目前位置" />}

            {/* Intermediate Markers */}
            {destinations.slice(0, -1).map((dest, index) => (
              <Marker
                key={`intermediate-${index}`}
                position={{
                  lat: dest.location.lat,
                  lng: dest.location.lng,
                }}
                label={`中間點${index + 1}`}
              />
            ))}

            {/* Terminal Marker */}
            {destinations.length > 0 && (
              <Marker
                position={{
                  lat: destinations[destinations.length - 1].location.lat,
                  lng: destinations[destinations.length - 1].location.lng,
                }}
                label="終點"
              />
            )}

            {/* Directions Renderer */}
            <Directions
              map={mapRef.current}
              origin={origin}
              waypoints={memoizedWaypoints}
              destination={
                destinations.length > 0
                  ? `${destinations[destinations.length - 1].location.lat},${destinations[destinations.length - 1].location.lng}`
                  : null
              }
              routes={routes}
              setRoutes={setRoutes}
              setTotalDistance={setTotalDistance}
              setTotalTime={setTotalTime}
              travelMode={travelMode as google.maps.TravelMode} // Now a string
              optimizeWaypoints={optimizeWaypoints}
              onWaypointsOptimized={handleWaypointsOptimized}
            />
          </GoogleMap>
        </div>

        {/* Navigation Card */}
        <Card className="my-10 shadow-lg mb-6">
          <CardHeader className="bg-black text-white p-4 rounded-t-md flex justify-between">
            <div>
              <CardTitle className="my-3 text-lg font-bold">導航地圖</CardTitle>
              <CardDescription className="my-3 text-white text-sm">
                顯示路線與地圖
              </CardDescription>
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



            {/* Travel Mode Selection */}
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant={travelMode === "DRIVING" ? "default" : "outline"}
                onClick={() => {
                  setTravelMode("DRIVING");
                }}
                className="flex items-center"
              >
                <FontAwesomeIcon icon={faCar} className="mr-2" />
                汽車
              </Button>
              <Button
                variant={travelMode === "WALKING" ? "default" : "outline"}
                onClick={() => {
                  setTravelMode("WALKING");
                }}
                className="flex items-center"
              >
                <FontAwesomeIcon icon={faWalking} className="mr-2" />
                走路
              </Button>
              <Button
                variant={travelMode === "BICYCLING" ? "default" : "outline"}
                onClick={() => {
                  setTravelMode("BICYCLING");
                }}
                className="flex items-center"
              >
                <FontAwesomeIcon icon={faBicycle} className="mr-2" />
                腳踏車
              </Button>
            </div>

                  {/* Recommend Route Button */}
            <Button
              onClick={handleRecommendRoute}
              className="mb-10 flex justify-center space-x-4 mb-6 bg-black text-white max-w-xs w-1/2 mx-auto block"
            >
              <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
              推薦路徑
            </Button>
            
            {/* Generate Navigation Link Button */}
              <Button
              onClick={handleGenerateNavigationLinkFromCurrentLocation}
              className="my-5 bg-black text-white max-w-xs w-1/2 mx-auto block"
            >
              生成導航連結
            </Button>

            {/* Total Distance and Time */}
            {totalDistance && totalTime && (
              <Card className="shadow-lg mb-6">
                <CardFooter className="p-4 flex flex-col space-y-4">
                  <div className="space-y-2">
                    <p className="text-lg text-bold">總距離: {totalDistance}</p>
                    <p className="text-lg text-bold">總時間: {totalTime}</p>
                  </div>
                </CardFooter>
              </Card>
            )}
            
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>錯誤</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Destinations List with Move Buttons and Distance/Time */}
            <div className="my-5">
              <h2 className="text-lg font-bold mb-2">訂單地點</h2>
              <ul className="space-y-2">
                {destinations.slice(0, -1).map((dest, index) => (
                  <li
                    key={`dest-${index}`}
                    className="p-2 border rounded-md bg-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{dest.name}</span>
                      {/* Show direction and time  */}
                      {legs[index] ? (
                        <span className="text-sm text-black-600">
                          距離: {legs[index].distance.text}, 時間: {legs[index].duration.text}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">距離和時間正在載入...</span>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
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
                        disabled={index >= destinations.length - 2}
                        variant="ghost"
                        className="p-1"
                        title="下移"
                      >
                        <FontAwesomeIcon icon={faArrowDown} />
                      </Button>
                      <Button
                        onClick={() => handleRemoveDestination(index)}
                        variant="ghost"
                        className="p-1 text-black-500"
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

            {/* Show the terminal */}
            {destinations.length > 0 && (
              <div className="my-5">
                <h2 className="text-lg font-bold mb-2">終點</h2>
                <div className="p-2 border rounded-md bg-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <span>{destinations[destinations.length - 1].name}</span>
                  {/* Show the distance and time about Terminal */}
                  {legs[legs.length - 1] ? (
                    <span className=" text-sm text-black-600">
                      距離: {legs[legs.length - 1].distance.text}, 時間: {legs[legs.length - 1].duration.text}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600">距離和時間正在載入...</span>
                  )}
                </div>
              </div>
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
                <DriverOrdersPage
                  driverData={driverData}
                  onAccept={handleAcceptOrder}
                  onTransfer={handleTransferOrder} 
                  onNavigate={(orderId: string) =>
                    handleNavigate(orderId, driverData.id || 0)
                  }
                  onComplete={handleCompleteOrder}
                />
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

// MapComponentContent.tsx

"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
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
  Marker,
  useJsApiLoader,
  LoadScriptProps,
} from "@react-google-maps/api";
import { useSearchParams, useRouter } from "next/navigation";
import Directions from "@/components/navigation/Directions";
import DriverOrdersPage from "@/components/navigation/DriverOrdersPage";
import { LatLng, Route, Leg } from "@/interfaces/navigation/navigation";
import { Driver,DriverOrder } from "@/interfaces/driver/driver";
import { Order } from "@/interfaces/tribe_resident/buyer/order";
import DriverService  from '@/services/driver/driver';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import MapContent from "@/components/navigation/MapContent";


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


const STORAGE_KEY = 'driverChecklist';

// Load checked items from localStorage
const loadCheckedItems = () => {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading checklist:', error);
    return {};
  }
};

// Save checked items to localStorage
const saveCheckedItems = (items: { [key: string]: boolean }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving checklist:', error);
  }
};

const MapComponentContent: React.FC = () => {

  const searchParams = useSearchParams();
  const driverIdParam = searchParams.get("driverId");
  const finalDestinationParam = searchParams.get("finalDestination");
  const waypointsParam = searchParams.get("waypoints")

  // Define state
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [legs, setLegs] = useState<Leg[]>([]); 
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showDriverOrders, setShowDriverOrders] = useState(false);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [optimizeWaypoints, setOptimizeWaypoints] = useState<boolean>(false);
  const [showLinkTip, setShowLinkTip] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [destinations, setDestinations] = useState<
    { name: string; location: LatLng }[]
  >([]);
  const [newDestinationName, setNewDestinationName] = useState<string>("");
  const [newDestinationLocation, setNewDestinationLocation] =
    useState<LatLng | null>(null);

  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT'>('DRIVING');
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(() => loadCheckedItems());


  const [searchInput, setSearchInput] = useState<string>("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize debounced search term
  const debouncedSearchTerm = useDebounce(searchInput, 800);


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

  // State to trigger force update
  const [forceUpdateTrigger, setForceUpdateTrigger] = useState<number>(0);

  // Function to trigger force update
  const triggerForceUpdate = () => {
    setForceUpdateTrigger((prev) => prev + 1);
  };

  const fetchDriverOrders = useCallback(async () => {
    try {
      if (!driverData) {
        throw new Error('Driver data is null');
      }
      const response = await fetch(`/api/drivers/${driverData.id}/orders`);
      if (!response.ok) {
        throw new Error('無法獲取司機訂單');
      }
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('獲取司機訂單時發生錯誤:', error);
      setError('獲取訂單失敗');
    }
  }, [driverData?.id]);



  // Memoized waypoints for Directions component
  const memoizedWaypoints = useMemo(() => {
    console.log("useMemo: memoizedWaypoints");
    return destinations.slice(0, -1).map(dest => ({
      location: dest.location,
      stopover: true,
    }));
  }, [destinations]);

  // Initialize Google Places services
  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      placesService.current = new google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  

  useEffect(() => {
    // Parse final destination and waypoints from URL params
    if (finalDestinationParam) {
      try {
        const finalDest = JSON.parse(decodeURIComponent(finalDestinationParam));
        // Update destinations with the final destination
        setDestinations(prev => {
          // Remove the last destination (terminal)
          const withoutLast = prev.length > 0 ? prev.slice(0, -1) : [];
          return [...withoutLast, {
            name: finalDest.name,
            location: finalDest.location
          }];
        });
      } catch (error) {
        console.error("解析最終目的地時出錯:", error);
        setError("解析目的地資訊時出錯");
      }
    }

    // Decode and parse waypoints from URL params
    if (waypointsParam) {
      try {
        const waypoints = JSON.parse(decodeURIComponent(waypointsParam));
        // Fetch coordinates for each waypoint
        Promise.all(waypoints.map(async (location: string) => {
          const coords = await fetchCoordinates(location);
          if (coords) {
            return {
              name: location,
              location: coords
            };
          }
          return null;
        })).then(validDestinations => {
          // Filter out null destinations
          const filteredDestinations = validDestinations.filter((dest): dest is { name: string; location: { lat: number; lng: number } } => dest !== null);
          
          setDestinations(prev => {
            // Remove the last destination (terminal)
            const terminal = prev[prev.length - 1];
            // Add the new waypoints
            return [...filteredDestinations, terminal];
          });
        });
      } catch (error) {
        console.error("解析中間點時出錯:", error);
        setError("解析路線資訊時出錯");
      }
    }
  }, [finalDestinationParam, waypointsParam]);

  // Get current location and watch for changes
  useEffect(() => {
    setShowLinkTip(true);
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
            setOrigin(newLoc);
            setError(null);

            // Update last position
            lastPositionRef.current = newLoc;

            // Throttle updates
            isThrottledRef.current = true;
            setTimeout(() => {
              isThrottledRef.current = false;
            }, 300000); 
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

 
  // Fetch driver data
  useEffect(() => {
    console.log("useEffect: fetchDriverData");
    if (driverIdParam) {
      fetchDriverData(driverIdParam);
    }
  }, [driverIdParam]);

  useEffect(() => {
    if (driverData?.id) {
      fetchDriverOrders();
    }
  }, [driverData, fetchDriverOrders]);


  // Extract legs from routes
  useEffect(() => {
    if (routes.length > 0 && routes[0].legs) {
      setLegs(routes[0].legs);
    } else {
      setLegs([]);
    }
  }, [routes]);

    // Fetch predictions when search term changes
    useEffect(() => {
      if (debouncedSearchTerm && debouncedSearchTerm.length >= 2 && autocompleteService.current) {
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
    }, [debouncedSearchTerm]);
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      if (!value) {
        setPredictions([]);
      }
    };
  
    const handlePlaceSelect = (placeId: string) => {
      if (placesService.current) {
        placesService.current.getDetails(
          {
            placeId: placeId,
            fields: ['formatted_address', 'name', 'geometry']
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              const fullLocation = `${place.name} ${place.formatted_address}`;
              setNewDestinationName(fullLocation);
              
              if (place.geometry?.location) {
                setNewDestinationLocation({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                });
              }
              
              setSearchInput(fullLocation);
              setPredictions([]);
              setError("");
            } else {
              setError("無法獲取地點詳細資訊");
            }
          }
        );
      }
    };

    useEffect(() => {
      saveCheckedItems(checkedItems);
    }, [checkedItems]);

    const handleClearChecklist = () => {
      setCheckedItems({});
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

    const originStr = `${currentLocation.lat},${currentLocation.lng}`;
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

    // Convert travelMode to lowercase for the URL
    const travelModeString = travelMode.toLowerCase() || "driving";

    // Generate navigation URL
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      originStr
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
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0 || index === destinations.length - 1) return;
    const newDestinations = Array.from(destinations);
    [newDestinations[index - 1], newDestinations[index]] = [
      newDestinations[index],
      newDestinations[index - 1],
    ];
    setDestinations(newDestinations);
    triggerForceUpdate(); 
  },[destinations]);

  // Function to handle moving a destination down
  const handleMoveDown = useCallback((index: number) => {
    if (index >= destinations.length - 2) return;
    const newDestinations = Array.from(destinations);
    [newDestinations[index + 1], newDestinations[index]] = [
      newDestinations[index],
      newDestinations[index + 1],
    ];
    setDestinations(newDestinations);
    triggerForceUpdate(); 
  },[destinations,triggerForceUpdate]);

  // Function to view order details
  const handleViewOrder = useCallback(() => {
    setShowDriverOrders(true);
    setIsSheetOpen(true);
  },[]);

  // Function to remove a specific destination
  const handleRemoveDestination = useCallback((index: number) => {
    if (index === destinations.length - 1) {
      setError("終點站可以編輯但不能刪除");
      return;
    }

    const updated = Array.from(destinations);
    updated.splice(index, 1);
    setDestinations(updated);
    triggerForceUpdate(); 
  },[destinations, triggerForceUpdate]);

  // Function to handle editing a terminal destination
  const handleEditTerminal = () => {
    if (!newDestinationName || !newDestinationLocation) {
      setError("請輸入有效的地點名稱");
      return;
    }

    const updatedDestinations = [...destinations];
    updatedDestinations[updatedDestinations.length - 1] = {
      name: newDestinationName,
      location: newDestinationLocation
    };

    setDestinations(updatedDestinations);
    setNewDestinationName("");
    setNewDestinationLocation(null);
    setError(null);
    triggerForceUpdate();
  };

  // Fetch driver data
  const fetchDriverData = useCallback(async (driverId: string) => {
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
  }, []);

  // Function to add a new destination
  const handleAddDestination = () => {
    if (!newDestinationName || !newDestinationLocation) {
      setError("請輸入有效的地點名稱");
      return;
    }

    // Check for duplicate destinations
    const newLatLng: LatLng = newDestinationLocation;

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
    const terminal = updatedDestinations.pop(); 
    updatedDestinations.push({ name: newDestinationName, location: newLatLng }); // 添加新的中間點
    if (terminal) {
      updatedDestinations.push(terminal); 
    }

    setDestinations(updatedDestinations);
    setNewDestinationName("");
    setNewDestinationLocation(null);
    setError(null);
    triggerForceUpdate(); 
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
        await DriverService.handle_accept_order(service, parseInt(orderId), acceptOrder)
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

        if (orderData && orderData.id === parseInt(orderId)) {
          setOrderData(null);
        }

        alert('轉單成功，已交給目標的司機');

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

        if (orderData && orderData.id === parseInt(orderId)) {
          setOrderData(null);
        }

        alert('訂單已完成');
        
    } catch (error) {
        console.error('Error completing order:', error);
        alert('完成訂單失敗');
    }
};


/**
 * Function to recommend route by optimizing waypoints
 */
const handleRecommendRoute = () => {
  if (destinations.length <= 2) {
    setError("至少需要兩個目的地才能推薦路徑。");
    return;
  }
  setOptimizeWaypoints(true);
  triggerForceUpdate(); 
};

/**
 * Callback to handle optimized waypoint order
 */
const handleWaypointsOptimized = useCallback((waypointOrder: number[]) => {
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
  triggerForceUpdate(); 
},[destinations]);


// Add this aggregation function inside MapComponentContent before the return statement
const aggregatedItemsByLocation = useMemo(() => {

  if (!driverData?.id) return [];
  
  const locationMap: { [location: string]: { [itemName: string]: number } } = {};

  orders.forEach(order => { 
    if (order.order_status === "接單") {
      order.items.forEach(item => {
        const location = item.location || "未指定地點";
        if (!locationMap[location]) {
          locationMap[location] = {};
        }
        if (locationMap[location][item.item_name]) {
          locationMap[location][item.item_name] += item.quantity;
        } else {
          locationMap[location][item.item_name] = item.quantity;
        }
      });
    }
  });

  // Convert locationMap to array
  const result: { location: string; items: { name: string; quantity: number }[] }[] = [];
  for (const [location, items] of Object.entries(locationMap)) {
    const itemList = Object.entries(items).map(([name, quantity]) => ({ name, quantity }));
    result.push({ location, items: itemList });
  }

  return result;
}, [orders]);
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

      {/* To remind client to click google navigation link  */}
      {showLinkTip && (
        <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">提醒：</strong>
            <span className="block sm:inline">請點擊導航連結，有更好的導航體驗。</span>
            <Button
                className="absolute top-0 bottom-0 right-0 px-4 py-3" 
                onClick={() => setShowLinkTip(false)}
            >
                <span aria-hidden="true">&times;</span>
            </Button>
        </div>
      )}
      
      {/* Google Map */}
      {/* Handle error and loading inside the JSX */}
      <MapContent loadError={!!loadError} isLoaded={isLoaded}>
        <div id="map" className="mb-6" style={{ height: "60vh", width: "100%" }}>
          <GoogleMap
            onLoad={(map) => {
              mapRef.current = map;
            }}
            center={currentLocation || { lat: 0, lng: 0 }} 
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
              <div className="my-5">
                <h2 className="text-lg font-bold mb-2">終點</h2>
                <div className="p-2 border rounded-md bg-gray-200">
                  <div className="flex justify-between items-center">
                    <span>{destinations[destinations.length - 1].name}</span>
                    <Button
                      variant="outline"
                      onClick={handleEditTerminal}
                      className="ml-2"
                    >
                      修改終點
                    </Button>
                  </div>
                  {legs[legs.length - 1] && (
                    <span className="text-sm text-black-600 block mt-2">
                      距離: {legs[legs.length - 1].distance.text}, 
                      時間: {legs[legs.length - 1].duration.text}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Directions Renderer */}
            <Directions
              map={mapRef.current}
              origin={origin}
              waypoints={memoizedWaypoints}
              destination={
                destinations.length > 0
                  ? destinations[destinations.length - 1].location
                  : null
              }
              routes={routes}
              setRoutes={setRoutes}
              setTotalDistance={setTotalDistance}
              setTotalTime={setTotalTime}
              travelMode={travelMode as google.maps.TravelMode} 
              optimizeWaypoints={optimizeWaypoints}
              onWaypointsOptimized={handleWaypointsOptimized}
              setError={setError}
              forceUpdateTrigger={forceUpdateTrigger} 
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

          <div className="flex overflow-auto justify-center mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="mb-4">
                查看所有訂單的運送物品
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4 overflow-auto max-h-80">
              {aggregatedItemsByLocation.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-md font-semibold">所有訂單的運送物品清單</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearChecklist}
                    >
                      清除所有勾選
                    </Button>
                  </div>
                  {aggregatedItemsByLocation.map((locationGroup, index) => {
                    // Calculate item keys for each location
                    const locationItems = locationGroup.items.map((item, idx) => 
                      `${locationGroup.location}-${item.name}-${idx}`
                    );
                    // Calculate checked count
                    const checkedCount = locationItems.filter(key => checkedItems[key]).length;
                    // Check if all items are checked
                    const isAllChecked = checkedCount === locationItems.length;

                    return (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">{locationGroup.location}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCheckedItems = { ...checkedItems };
                              // If all items are checked, uncheck all items
                              locationItems.forEach(itemKey => {
                                newCheckedItems[itemKey] = !isAllChecked;
                              });
                              setCheckedItems(newCheckedItems);
                            }}
                          >
                            {isAllChecked ? "取消全選" : "全部勾選"}
                          </Button>
                        </div>
                        <table className="w-full table-auto mb-2">
                          <thead>
                            <tr>
                              <th className="text-left border-b pb-1">物品名稱</th>
                              <th className="text-right border-b pb-1">數量</th>
                              <th className="text-center border-b pb-1 w-20">已購買</th>
                            </tr>
                          </thead>
                          <tbody>
                            {locationGroup.items.map((item, idx) => {
                              const itemKey = `${locationGroup.location}-${item.name}-${idx}`;
                              return (
                                <tr key={idx} className={checkedItems[itemKey] ? "bg-gray-50" : ""}>
                                  <td className="py-1">
                                    <span className={checkedItems[itemKey] ? "line-through text-gray-500" : ""}>
                                      {item.name}
                                    </span>
                                  </td>
                                  <td className="text-right py-1">{item.quantity}</td>
                                  <td className="text-center py-1">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 rounded border-gray-300"
                                      checked={checkedItems[itemKey] || false}
                                      title="已購買"
                                      onChange={(e) => {
                                        const newCheckedItems = {
                                          ...checkedItems,
                                          [itemKey]: e.target.checked
                                        };
                                        setCheckedItems(newCheckedItems);
                                      }}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {/* Show progress */}
                        <div className="mt-2 text-sm text-gray-600">
                          {`完成進度: ${checkedCount}/${locationItems.length} (${Math.round((checkedCount / locationItems.length) * 100)}%)`}
                        </div>
                      </div>
                    );
                  })}
                  {/* Show the total progress */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      {(() => {
                        const totalItems = aggregatedItemsByLocation.reduce((acc, group) => 
                          acc + group.items.length, 0
                        );
                        const totalChecked = Object.values(checkedItems).filter(Boolean).length;
                        const percentage = Math.round((totalChecked / totalItems) * 100);
                        return `總體完成進度: ${totalChecked}/${totalItems} (${percentage}%)`;
                      })()}
                    </p>
                  </div>
                </div>
              ) : (
                <p>目前沒有需要運送的物品。</p>
              )}
            </PopoverContent>
          </Popover>
        </div>

          {/* Travel Mode Selection */}
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              variant={travelMode === 'DRIVING' ? "default" : "outline"}
              onClick={() => {
                setTravelMode(google.maps.TravelMode.DRIVING);
                triggerForceUpdate(); 
              }}
              className="flex items-center"
            >
              <FontAwesomeIcon icon={faCar} className="mr-2" />
              汽車
            </Button>
            <Button
              variant={travelMode === 'WALKING' ? "default" : "outline"}
              onClick={() => {
                setTravelMode(google.maps.TravelMode.WALKING);
                triggerForceUpdate(); 
              }}
              className="flex items-center"
            >
              <FontAwesomeIcon icon={faWalking} className="mr-2" />
              走路
            </Button>
            <Button
              variant={travelMode === 'BICYCLING' ? "default" : "outline"}
              onClick={() => {
                setTravelMode(google.maps.TravelMode.BICYCLING);
                triggerForceUpdate(); 
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
            className="mb-10 flex justify-center space-x-4 bg-black text-white max-w-xs w-1/2 mx-auto block"
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
                  <p className="text-lg font-bold">總距離: {totalDistance}</p>
                  <p className="text-lg font-bold">總時間: {totalTime}</p>
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
            <div className="relative w-full">
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
      <SheetContent 
        side="right"
        className="w-full sm:max-w-2xl p-0 sm:p-6"
      >
        <SheetHeader className="p-6 sm:p-0">
          <SheetTitle>訂單詳情</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100vh-80px)] p-6 sm:p-0">
          {showDriverOrders ? (
            driverData ? (
              <DriverOrdersPage
                driverData={driverData}
                onAccept={handleAcceptOrder}
                onTransfer={handleTransferOrder} 
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
        </div>
      </SheetContent>
    </Sheet>
    </MapContent>
    </div>
  </Suspense>
);    

}

export default MapComponentContent;

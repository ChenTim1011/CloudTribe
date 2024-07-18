// components/navigation/MapComponent.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useState, useRef, useCallback } from "react";
import { LoadScript, GoogleMap, Autocomplete, Marker } from "@react-google-maps/api";
import Directions from "./Directions";

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
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [center, setCenter] = useState<{ lat: number, lng: number }>({ lat: 24.987772543745507, lng: 121.57809269945467 });
  const [error, setError] = useState<string | null>(null);

  const autocompleteOriginRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDestinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = useCallback((autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>, setFn: React.Dispatch<React.SetStateAction<string>>) => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        setFn(`${location.lat()},${location.lng()}`);
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

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string} libraries={libraries}>
      <div className="max-w-full mx-auto my-6 space-y-4">
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
                  onPlaceChanged={() => handlePlaceChanged(autocompleteOriginRef, setOrigin)}
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
                  onPlaceChanged={() => handlePlaceChanged(autocompleteDestinationRef, setDestination)}
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
        <Card className="shadow-lg">
          <CardFooter className="p-4 flex flex-col space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-bold">其他路線</h2>
              <ul>
                {routes.map((route, index) => (
                  <li key={route.summary} className="my-2">
                    <Button onClick={() => setRouteIndex(index)}>
                      {route.summary}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardFooter>
        </Card>
      </div>
    </LoadScript>
  );
};

export default MapComponent;

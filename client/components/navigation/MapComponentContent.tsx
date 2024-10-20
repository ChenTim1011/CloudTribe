"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { GoogleMap, Autocomplete, Marker, useJsApiLoader, LoadScriptProps } from "@react-google-maps/api";
import Directions from "@/components/navigation/Directions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

const libraries: LoadScriptProps['libraries'] = ["places"];

const MapComponentContent: React.FC = () => {
  const searchParams = useSearchParams();
  const driverId = searchParams.get('driverId');
  const orderId = searchParams.get('orderId');

  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [originName, setOriginName] = useState<string>("");
  const [destinationName, setDestinationName] = useState<string>("");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [center, setCenter] = useState<{ lat: number, lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigationUrl, setNavigationUrl] = useState<string | null>(null);

  const autocompleteOriginRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDestinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'zh-TW',
  });

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
  }, []);

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
      }
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

  if (loadError) {
    return <div>地圖加載失敗</div>;
  }

  if (!isLoaded) {
    return <div>正在加載地圖...</div>;
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
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
      <div>
        <Button onClick={handleMoveMapToOrigin}>移動地圖到起點</Button>
        <Button onClick={handleMoveMapToDestination}>移動地圖到終點</Button>
        <Button onClick={handleGenerateNavigationLink}>生成導航連結</Button>
        {navigationUrl && (
          <p className="text-center mt-2">
            <a href={navigationUrl} target="_blank" rel="noopener noreferrer">點此查看從 {originName} 到 {destinationName} 的導路徑</a>
          </p>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MapComponentContent;

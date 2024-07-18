"use client";
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";

// 定義 Directions 的 Props 類型
interface DirectionsProps {
  onDriverLocationChange?: (location: { lat: number, lng: number }) => void;
}

// 定義 Directions 的內部狀態類型
interface Route {
  summary: string;
  legs: {
    start_address: string;
    end_address: string;
    distance: { text: string };
    duration: { text: string };
  }[];
}

// MapComponent 組件
const MapComponent: React.FC = () => {
  const position = { lat: 24.987772543745507, lng: 121.57809269945467 };

  // 設置起點和終點的狀態
  const [origin, setOrigin] = useState<string>("政治大學");
  const [destination, setDestination] = useState<string>("飛鼠不渴露營農場");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);

  // 獲取當前位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOrigin(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <Card className="max-w-full mx-auto my-6 shadow-lg">
      <CardHeader className="bg-black text-white p-4 rounded-t-md">
        <CardTitle className="text-lg font-bold">導航地圖</CardTitle>
        <CardDescription className="text-sm">顯示路線與地圖</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div style={{ height: "60vh", width: "100%" }}>
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <Map
              center={position}
              zoom={17}
              mapId={process.env.NEXT_PUBLIC_MAP_ID}
              fullscreenControl={true}
              options={{
                gestureHandling: "auto",
                zoomControl: true,
                streetViewControl: true,
                mapTypeControl: true,
              }}
            >
              <Directions
                routes={routes}
                setRoutes={setRoutes}
                routeIndex={routeIndex}
                setRouteIndex={setRouteIndex}
                origin={origin}
                destination={destination}
                setTotalDistance={setTotalDistance}
                setTotalTime={setTotalTime}
              />
            </Map>
          </APIProvider>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col space-y-4">
        <div>
          <h2 className="text-lg font-bold">設置起點和終點</h2>
          <Button onClick={getCurrentLocation}>使用當前位置</Button>
          <Input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="輸入起點"
            className="mt-2"
          />
          <Input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="輸入終點"
            className="mt-2"
          />
        </div>
        {totalDistance && totalTime && (
          <div>
            <p className="text-lg">總距離: {totalDistance}</p>
            <p className="text-lg">總時間: {totalTime}</p>
          </div>
        )}
        <div>
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
        <div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            返回主頁
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Directions 組件
const Directions: React.FC<DirectionsProps & {
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  routeIndex: number;
  setRouteIndex: React.Dispatch<React.SetStateAction<number>>;
  origin: string;
  destination: string;
  setTotalDistance: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalTime: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({
  routes,
  setRoutes,
  routeIndex,
  setRouteIndex,
  origin,
  destination,
  setTotalDistance,
  setTotalTime,
}) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    directionsService
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes as Route[]);
        const firstLeg = response.routes[0].legs[0];
        setTotalDistance(firstLeg.distance.text);
        setTotalTime(firstLeg.duration.text);
      });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, origin, destination, setRoutes, setTotalDistance, setTotalTime]);

  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  if (!leg) return null;

  return (
    <div className="directions">
      <h2>{selected.summary}</h2>
      <p>
        {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
      </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Duration: {leg.duration?.text}</p>
    </div>
  );
};

export default MapComponent;

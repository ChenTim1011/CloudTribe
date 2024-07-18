// components/navigation/MapComponent.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
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

const MapComponent: React.FC = () => {
  const position = { lat: 24.987772543745507, lng: 121.57809269945467 };

  const [origin, setOrigin] = useState<string>("政治大學");
  const [destination, setDestination] = useState<string>("飛鼠不渴露營農場");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);

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
    <div className="max-w-full mx-auto my-6 space-y-4">
      <Card className="shadow-lg">
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
      </Card>
      <Card className="shadow-lg">
        <CardFooter className="p-4 flex flex-col space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-bold">設置起點和終點  <Button onClick={getCurrentLocation}>使用當前位置</Button> </h2>
            起點:
            <Input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="輸入起點"
              className="mt-2"
            />
            終點:
            <Input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="輸入終點"
              className="mt-2"
            />
          </div>
        </CardFooter>
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
  );
};

export default MapComponent;

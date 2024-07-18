// components/navigation/Directions.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useMapsLibrary, useMap } from "@vis.gl/react-google-maps";

interface DirectionsProps {
  onDriverLocationChange?: (location: { lat: number, lng: number }) => void;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  routeIndex: number;
  setRouteIndex: React.Dispatch<React.SetStateAction<number>>;
  origin: string;
  destination: string;
  setTotalDistance: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalTime: React.Dispatch<React.SetStateAction<string | null>>;
}

interface Route {
  summary: string;
  legs: {
    start_address: string;
    end_address: string;
    distance: { text: string };
    duration: { text: string };
  }[];
}

const Directions: React.FC<DirectionsProps> = ({
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
    <Card className="max-w-full mx-auto my-6 shadow-lg space-y-4">

    </Card>
  );
};

export default Directions;

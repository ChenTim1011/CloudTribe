// components/navigation/Directions.tsx
"use client";
import { useEffect, useState } from "react";
import { DirectionsRenderer, DirectionsService } from "@react-google-maps/api";

interface DirectionsProps {
  origin: string;
  destination: string;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
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
  origin,
  destination,
  routes,
  setRoutes,
  setTotalDistance,
  setTotalTime,
}) => {
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!window.google) return;

    setDirectionsService(new window.google.maps.DirectionsService());
    setDirectionsRenderer(new window.google.maps.DirectionsRenderer());
  }, []);

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

  return null;
};

export default Directions;

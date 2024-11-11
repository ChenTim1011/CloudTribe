// components/navigation/Directions.tsx

"use client";
import React, { useState, useEffect } from "react";
import { DirectionsRenderer } from "@react-google-maps/api";
import { DirectionsProps } from "@/interfaces/navigation/DirectionsProps";
import { Route } from "@/interfaces/navigation/Route";

/**
 * Renders the directions component.
 * 
 * @param map - The Google Maps instance.
 * @param origin - The origin location.
 * @param destinations - The array of destination locations.
 * @param routes - The available routes.
 * @param setRoutes - The function to set the routes.
 * @param setTotalDistance - The function to set the total distance.
 * @param setTotalTime - The function to set the total time.
 * @returns JSX.Element
 */
const Directions: React.FC<DirectionsProps> = ({
  map,
  origin,
  destinations,
  routes,
  setRoutes,
  setTotalDistance,
  setTotalTime,
}) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || destinations.length === 0) {
      console.log("Origin or destinations are missing");
      return;
    }

    console.log("Requesting directions:");
    console.log("Origin:", origin);
    console.log("Destinations:", destinations);

    const directionsService = new google.maps.DirectionsService();

    // Depart destination and waypoints
    const destination = destinations[destinations.length - 1].location;
    const waypoints = destinations.slice(0, -1).map(dest => ({
      location: dest.location,
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        optimizeWaypoints: true, 
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log("DirectionsService Response:", result);
          setDirections(result);
          setRoutes(result.routes as Route[]);

          // calculate total distance and time
          const totalDistance = result.routes[0].legs.reduce((acc, leg) => acc + (leg.distance?.value ?? 0), 0) / 1000; // 公里
          const totalTime = result.routes[0].legs.reduce((acc, leg) => acc + (leg.duration?.value ?? 0), 0) / 60; // 分鐘

          setTotalDistance(`${totalDistance.toFixed(2)} 公里`);
          setTotalTime(`${Math.ceil(totalTime)} 分鐘`);
          setDirectionsError(null);
        } else {
          console.error("DirectionsService Error:", status);
          setDirectionsError("無法獲取路線，請檢查起點和終點是否正確。");
        }
      }
    );
  }, [origin, destinations, setRoutes, setTotalDistance, setTotalTime]);

  return (
    <>
      {directions && <DirectionsRenderer directions={directions} />}
      {directionsError && (
        <div className="error">
          {directionsError}
        </div>
      )}
    </>
  );
};

export default Directions;

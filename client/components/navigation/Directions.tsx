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
 * @param destination - The destination location.
 * @param routes - The available routes.
 * @param setRoutes - The function to set the routes.
 * @param setTotalDistance - The function to set the total distance.
 * @param setTotalTime - The function to set the total time.
 * @returns JSX.Element
 */
const Directions: React.FC<DirectionsProps> = ({
  map,
  origin,
  destination,
  routes,
  setRoutes,
  setTotalDistance,
  setTotalTime,
}) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination) {
      console.log("Origin or destination is missing");
      return;
    }

    console.log("Requesting directions:");
    console.log("Origin:", origin);
    console.log("Destination:", destination);

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log("DirectionsService Response:", result);
          setDirections(result);
          setRoutes(result.routes as Route[]);

          const firstLeg = result.routes[0].legs[0];
          if (firstLeg.distance) {
            setTotalDistance(firstLeg.distance.text);
          }
          if (firstLeg.duration) {
            setTotalTime(firstLeg.duration.text);
          }
          setDirectionsError(null);
        } else {
          console.error("DirectionsService Error:", status);
          setDirectionsError("無法獲取路線，請檢查起點和終點是否正確。");
        }
      }
    );
  }, [origin, destination, setRoutes, setTotalDistance, setTotalTime]);

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

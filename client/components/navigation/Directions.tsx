// components/navigation/Directions.tsx

import React, { useEffect } from "react";
import { DirectionsProps } from "@/interfaces/navigation/DirectionsProps";
import { Route } from "@/interfaces/navigation/Route";

const Directions: React.FC<DirectionsProps> = ({
  map,
  origin,
  waypoints,
  destination,
  routes,
  setRoutes,
  setTotalDistance,
  setTotalTime,
}) => {
  useEffect(() => {
    if (!map || !origin || !destination) return;

    if (
      typeof google === "undefined" ||
      !google.maps ||
      !google.maps.DirectionsService ||
      !google.maps.DirectionsRenderer
    ) {
      console.error("Google Maps API is not loaded properly.");
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
    });

    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      waypoints: waypoints.map((wp) => ({
        location: wp.location,
        stopover: true,
      })),
      optimizeWaypoints: false, // If true, the Directions service will attempt to re-order the supplied waypoints to minimize overall cost of the route. If waypoints are optimized, inspect DirectionsRoute.waypoint_order in the response to determine the new ordering.
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        const route = result.routes[0];

        // Map DirectionsRoute to Route
        const mappedRoutes: Route[] = result.routes.map((route) => ({
          summary: route.summary || "",
          legs: route.legs.map((leg) => ({
            distance: {
              text: leg.distance?.text || "0 km",
              value: leg.distance?.value || 0,
            },
            duration: {
              text: leg.duration?.text || "0 分鐘",
              value: leg.duration?.value || 0,
            },
            start_address: leg.start_address || "",
            end_address: leg.end_address || "",
            steps: leg.steps?.map((step) => ({
              instructions: step.instructions || "",
              distance: step.distance?.text || "",
              duration: step.duration?.text || "",
            })) || [],
          })),
        }));

        setRoutes(mappedRoutes); // Set routes to state

        // Calculate total distance and time
        const totalDistanceMeters = route.legs.reduce(
          (acc, leg) => acc + (leg.distance?.value || 0),
          0
        );
        const totalTimeSeconds = route.legs.reduce(
          (acc, leg) => acc + (leg.duration?.value || 0),
          0
        );

        setTotalDistance(`${(totalDistanceMeters / 1000).toFixed(2)} km`);
        setTotalTime(`${Math.floor(totalTimeSeconds / 60)} 分鐘`);
      } else {
        console.error("Directions request failed due to " + status);
      }
    });

    // Clean up the directions renderer when the component unmounts
    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, origin, waypoints, destination, setRoutes, setTotalDistance, setTotalTime]);

  return null; 
};

export default Directions;

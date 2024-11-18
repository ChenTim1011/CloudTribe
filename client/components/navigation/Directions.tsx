// components/navigation/Directions.tsx

import React, { useEffect, useRef } from "react";
import { DirectionsProps } from "@/interfaces/navigation/navigation";
import { Route } from "@/interfaces/navigation/navigation";

const Directions: React.FC<DirectionsProps> = ({
  map,
  origin,
  waypoints,
  destination,
  routes,
  setRoutes,
  setTotalDistance,
  setTotalTime,
  travelMode,
  optimizeWaypoints,
  onWaypointsOptimized,
}) => {
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

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

    // Initialize DirectionsRenderer if it hasn't been already
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
      });
    }

    const directionsService = new google.maps.DirectionsService();

    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      waypoints: waypoints.map((wp) => ({
        location: wp.location,
        stopover: true,
      })),
      optimizeWaypoints: optimizeWaypoints,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);
        }
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
      
        // If waypoints are optimized, call the callback function with the optimized waypoint order
        if (optimizeWaypoints && result.routes[0].waypoint_order && onWaypointsOptimized) {
          onWaypointsOptimized(result.routes[0].waypoint_order);
        }
        
      
      } else {
        console.error("Directions request failed due to " + status);
      }
    });

    // Clean up the directions renderer when the component unmounts
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, [map, 
    origin, 
    waypoints, 
    destination, 
    setRoutes, 
    setTotalDistance, 
    setTotalTime, 
    travelMode,
    optimizeWaypoints,
    onWaypointsOptimized,
  ]);

  return null;
};

export default Directions;

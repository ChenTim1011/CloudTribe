// components/navigation/Directions.tsx

import React, { useEffect, useRef } from "react";
import { throttle } from "lodash";
import { DirectionsProps, Route } from "@/interfaces/navigation/navigation";

// Use React.memo to prevent unnecessary re-renders
const Directions: React.FC<DirectionsProps> = React.memo(({
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
  setError,
  forceUpdateTrigger, // To force update the route
}) => {
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const prevRequestRef = useRef<string>(""); // To compare with the previous request

  // Define the function to handle directions request
  const handleDirectionsRequest = (request: google.maps.DirectionsRequest) => {
    const directionsService = new google.maps.DirectionsService();

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
        setError(`Directions request failed: ${status}`);
      }
    });
  };

  // Throttled route request per minute
  const throttledRoute = useRef(
    throttle((request: google.maps.DirectionsRequest) => {
      handleDirectionsRequest(request);
    }, 60000) 
  ).current;

  // Immidiate route request
  const immediateRoute = (request: google.maps.DirectionsRequest) => {
    handleDirectionsRequest(request);
  };

  // Initialize DirectionsRenderer
  useEffect(() => {
    if (!map) return;

    if (typeof google === "undefined" ||
        !google.maps ||
        !google.maps.DirectionsService ||
        !google.maps.DirectionsRenderer) {
      console.error("Google Maps API is not loaded properly.");
      setError("Google Maps API 加載失敗。");
      return;
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
      });
    }
  }, [map, setError]);

  // Normal route request
  useEffect(() => {
    if (!map || !origin || !destination) return;

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      travelMode: travelMode,
      waypoints: waypoints.map((wp) => ({
        location: new google.maps.LatLng(wp.location.lat, wp.location.lng),
        stopover: wp.stopover,
      })),
      optimizeWaypoints: optimizeWaypoints,
    };

    // To compare with the previous request
    const requestKey = JSON.stringify(request);

    if (prevRequestRef.current === requestKey) {
      console.log("Same request, skipping...");
      return;
    }

    prevRequestRef.current = requestKey;

    // Use throttled version of route request
    throttledRoute(request);
  }, [
    map,
    origin,
    waypoints,
    destination,
    setRoutes,
    setTotalDistance,
    setTotalTime,
    travelMode,
    optimizeWaypoints,
    onWaypointsOptimized,
    throttledRoute,
    setError,
  ]);

  // Force update trigger
  useEffect(() => {
    if (!map || !origin || !destination) return;

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      travelMode: travelMode,
      waypoints: waypoints.map((wp) => ({
        location: new google.maps.LatLng(wp.location.lat, wp.location.lng),
        stopover: wp.stopover,
      })),
      optimizeWaypoints: optimizeWaypoints,
    };

    
    immediateRoute(request);
  }, [forceUpdateTrigger, map, origin, waypoints, destination, travelMode, optimizeWaypoints]);

  return null;
});

export default Directions;

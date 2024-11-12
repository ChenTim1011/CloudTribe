// components/navigation/Directions.tsx

import React, { useEffect } from "react";
import { DirectionsProps } from "@/interfaces/navigation/DirectionsProps"; // 假設您有這個接口

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
      optimizeWaypoints: false, // 如果需要優化路徑，可以設置為 true
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        const route = result.routes[0];
        setRoutes(
          route.legs.map((leg) => ({
            distance: leg.distance?.text || "",
            duration: leg.duration?.text || "",
            summary: route.summary || "",
            legs: route.legs.map((leg) => ({
              distance: leg.distance?.text || "",
              duration: leg.duration?.text || "",
              start_address: leg.start_address || "",
              end_address: leg.end_address || "",
              steps: leg.steps?.map((step) => ({
                instructions: step.instructions || "",
                distance: step.distance?.text || "",
                duration: step.duration?.text || "",
              })) || [],
            })),
          }))
        );

        const totalDistance = route.legs.reduce(
          (acc, leg) => acc + (leg.distance?.value || 0),
          0
        );
        const totalTime = route.legs.reduce(
          (acc, leg) => acc + (leg.duration?.value || 0),
          0
        );

        setTotalDistance(`${(totalDistance / 1000).toFixed(2)} km`);
        setTotalTime(`${Math.floor(totalTime / 60)} 分鐘`);
      } else {
        console.error("Directions request failed due to " + status);
      }
    });

    // 清除 DirectionsRenderer 當組件卸載或依賴變更時
    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, origin, waypoints, destination, setRoutes, setTotalDistance, setTotalTime]);

  return null; // 此組件不需要渲染任何內容
};

export default Directions;

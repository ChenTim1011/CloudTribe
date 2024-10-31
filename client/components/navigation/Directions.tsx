"use client";
import React, { useState, useEffect } from "react";
import { DirectionsRenderer, DirectionsService } from "@react-google-maps/api";
import { DirectionsProps } from "@/interfaces/navigation/DirectionsProps";
import { Route } from "@/interfaces/navigation/Route";

/**
 * Renders the directions component.
 * 
 * @param origin - The origin location.
 * @param destination - The destination location.
 * @param routes - The available routes.
 * @param setRoutes - The function to set the routes.
 * @param setTotalDistance - The function to set the total distance.
 * @param setTotalTime - The function to set the total time.
 * @returns null
 */
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
    if (typeof window !== 'undefined' && window.google) {
      setDirectionsService(new window.google.maps.DirectionsService());
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer());
    }
  }, []);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    }).then((response) => {
      directionsRenderer.setDirections(response);
      setRoutes(response.routes as Route[]);

      const firstLeg = response.routes[0].legs[0];
      if (firstLeg.distance) {
        setTotalDistance(firstLeg.distance.text);
      }
      if (firstLeg.duration) {
        setTotalTime(firstLeg.duration.text);
      }
    });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, origin, destination, setRoutes, setTotalDistance, setTotalTime]);

  return null;
};

export default Directions;

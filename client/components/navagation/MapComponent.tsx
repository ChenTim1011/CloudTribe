// src/components/MapComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

import { google } from "@googlemaps/markerclusterer";

declare global {
  interface Window {
    google: typeof google;
  }
}

const MapComponent: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
  const [map, setMap] = useState<google.maps.Map>();
  const ref = useRef<HTMLDivElement>(null);
  const [markerCluster, setMarkerClusters] = useState<MarkerClusterer>();
  const [marker, setMarker] = useState<{ lat: number; lng: number } | undefined>();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {
        center: center,
        zoom: 10,
      }));
    }
    if (map && !markerCluster) {
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const { lat, lng } = e.latLng;
          setMarker({ lat: lat(), lng: lng() });
        }
      });
      setMarkerClusters(new MarkerClusterer({ map, markers: [] }));
    }
  }, [map, markerCluster]);

  useEffect(() => {
    if (marker && markerCluster) {
      markerCluster.clearMarkers();
      markerCluster.addMarker(
        new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng }
        })
      );
    }
  }, [marker, markerCluster]);

  return (
    <div ref={ref} style={{ height: "100%", width: "700px", minHeight: "700px" }}></div>
  );
};

export default MapComponent;

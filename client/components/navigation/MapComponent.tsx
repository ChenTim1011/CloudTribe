"use client";

import React, { Suspense } from "react";
import MapComponentContent from "./MapComponentContent";

const MapComponent: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <MapComponentContent />
    </Suspense>
  );
};

export default MapComponent;

"use client";
import { Suspense } from "react";
import { NavigationBar } from "@/components/NavigationBar";
import MapComponent from "@/components/navigation/MapComponent";

const Navigation: React.FC = () => {
  return (
    <div>
      <NavigationBar />
      <Suspense fallback={<div>Loading...</div>}>
        <MapComponent />
      </Suspense>
    </div>
  );
};

export default Navigation;
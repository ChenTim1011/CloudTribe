"use client";
import { NavigationBar } from "@/components/NavigationBar";
import MapComponent from "@/components/navigation/MapComponent";
import { Suspense } from "react";

const NavigationPage: React.FC = () => {

  return (
    <div>
      <NavigationBar />
      <Suspense fallback={<div>Loading...</div>}>
        <MapComponent />
      </Suspense>
    </div>
  );
};

export default NavigationPage;

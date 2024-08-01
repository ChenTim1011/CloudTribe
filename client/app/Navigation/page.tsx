// components/navigation/Navigation.tsx
"use client";
import { NavigationBar } from "@/components/NavigationBar";
import MapComponent from "@/components/navigation/MapComponent";

const Navigation: React.FC = () => {
  return (
    <div>
      <NavigationBar />
      <MapComponent />
    </div>
  );
};

export default Navigation;

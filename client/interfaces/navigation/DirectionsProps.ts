// interfaces/navigation/DirectionsProps.ts

import { Route } from "./Route";

export interface DirectionsProps {
  map: google.maps.Map | null;
  origin: string;
  waypoints: { name: string; location: string }[];
  destination: string | null;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setTotalDistance: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalTime: React.Dispatch<React.SetStateAction<string | null>>;
}
// interfaces/navigation/DirectionsProps.ts

import { Route } from "./Route";

export interface DirectionsProps {
  map: google.maps.Map | null;
  origin: string;
  destinations: { name: string; location: string }[];
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setTotalDistance: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalTime: React.Dispatch<React.SetStateAction<string | null>>;
}
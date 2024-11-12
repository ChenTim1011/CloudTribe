// interfaces/navigation/DirectionsProps.ts

import { Route } from "./Route";
import { LatLng } from "./LatLng";
export interface DirectionsProps {
  map: google.maps.Map | null;
  origin: string;
  waypoints: { location: LatLng; stopover: boolean }[];
  destination: string | null;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setTotalDistance: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalTime: React.Dispatch<React.SetStateAction<string | null>>;
}
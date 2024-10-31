// interfaces/navigation/MapComponentState.ts

import { Route } from "./Route";
import { LatLng } from "./LatLng";

export interface MapComponentState {
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
  totalDistance: string | null;
  totalTime: string | null;
  routes: Route[];
  currentLocation: LatLng | null;
  center: LatLng | null;
  error: string | null;
  navigationUrl: string | null;
}

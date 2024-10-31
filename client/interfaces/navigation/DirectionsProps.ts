// interfaces/navigation/DirectionsProps.ts

import { Route } from "./Route";

export interface DirectionsProps {
  origin: string;
  destination: string;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setTotalDistance: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalTime: React.Dispatch<React.SetStateAction<string | null>>;
}



export interface DirectionsProps {
  map: google.maps.Map | null;
  origin: LatLng | null; 
  waypoints: { location: LatLng; stopover: boolean }[];
  destination: LatLng | null;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setTotalDistance: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalTime: React.Dispatch<React.SetStateAction<string | null>>;
  travelMode: google.maps.TravelMode;
  optimizeWaypoints: boolean; 
  onWaypointsOptimized?: (waypointOrder: number[]) => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  forceUpdateTrigger?: any; 
}


export interface LatLng {
  lat: number;
  lng: number;
}

export interface Step {
  instructions: string;
  distance: string;
  duration: string;
}

export interface Leg {
    distance: {
      text: string;
      value: number;
    };
    duration: {
      text: string;
      value: number;
    };
    start_address: string;
    end_address: string;
    steps: Step[];
  }

  export interface Route {
    legs: Leg[];
    summary: string;
  }
  

export interface MapComponentState {
  origin: LatLng | null;
  destination: LatLng | null;
  originName: string;
  destinationName: string;
  totalDistance: string | null;
  totalTime: string | null;
  routes: Route[];
  currentLocation: LatLng | null;
  error: string | null;
  navigationUrl: string | null;
}




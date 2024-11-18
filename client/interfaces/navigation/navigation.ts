

export interface DirectionsProps {
  map: google.maps.Map | null;
  origin: string;
  waypoints: { location: LatLng; stopover: boolean }[];
  destination: string | null;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setTotalDistance: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalTime: React.Dispatch<React.SetStateAction<string | null>>;
  travelMode: google.maps.TravelMode;
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




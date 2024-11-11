// interfaces/navigation/Route.ts

export interface Route {
  
    summary: string;
    legs: google.maps.DirectionsLeg[];
  }
  
  export interface Leg {
    start_address: string;
    end_address: string;
    distance: { text: string };
    duration: { text: string };
  }
  
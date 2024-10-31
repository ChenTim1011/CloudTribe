// interfaces/navigation/Route.ts

export interface Route {
    summary: string;
    legs: Leg[];
  }
  
  export interface Leg {
    start_address: string;
    end_address: string;
    distance: { text: string };
    duration: { text: string };
  }
  
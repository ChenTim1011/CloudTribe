// interfaces/navigation/Route.ts

export interface Route {
  summary: string;
  legs: Leg[];
}

export interface Leg {
  start_address: string;
  end_address: string;
  distance: string;
  duration: string;
  steps?: Step[];
}

export interface Step {
  instructions: string;
  distance: string;
  duration: string;
}
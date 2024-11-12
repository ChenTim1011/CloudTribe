// interfaces/navigation/Route.ts
import { Step } from "./Step";
import { Leg } from "./Leg";

export interface Route {
  legs: Leg[];
  summary: string;
}
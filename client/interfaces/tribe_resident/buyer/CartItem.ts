import { Product } from './Product';

export type CartItem = Product & {
  quantity: number;
  location?: string; // add location property (optional)
};

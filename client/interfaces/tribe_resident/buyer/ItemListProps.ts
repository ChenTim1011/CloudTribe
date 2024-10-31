import { Product } from './Product';

export type ItemListProps = {
  products: Product[];
  itemsPerPage: number;
  addToCart: (product: Product, quantity: number) => void;
};

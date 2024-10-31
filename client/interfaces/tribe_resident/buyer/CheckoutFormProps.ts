import { CartItem } from './CartItem';

export type CheckoutFormProps = {
  onClose: () => void;
  clearCart: () => void;
  cartItems: CartItem[];
  totalPrice: number;
};

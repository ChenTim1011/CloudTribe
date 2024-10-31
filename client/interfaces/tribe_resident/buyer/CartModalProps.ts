import { CartItem } from './CartItem';

export type CartModalProps = {
  cart: CartItem[];
  onClose: () => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartItems: CartItem[];
  totalPrice: number;
};

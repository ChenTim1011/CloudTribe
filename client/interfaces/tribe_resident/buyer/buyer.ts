export type AddItemFormProps = {
    onClose: () => void;
    addToCart: (item: { name: string; quantity: number; price: number; img: string; location?: string }) => void; // 添加 location 屬性（可選）
  };
  

  
export type CartItem = Product & {
  quantity: number;
  location?: string; // add location property (optional)
};

export type CartModalProps = {
  cart: CartItem[];
  onClose: () => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartItems: CartItem[];
  totalPrice: number;
};

export type CheckoutFormProps = {
  onClose: () => void;
  clearCart: () => void;
  cartItems: CartItem[];
  totalPrice: number;
};

export type ItemListProps = {
  products: Product[];
  itemsPerPage: number;
  addToCart: (product: Product, quantity: number) => void;
};

export type Product = {
  category: string;
  img: string;
  id: string;
  name: string;
  price: number;
  location?: string; // add location property (optional)
};

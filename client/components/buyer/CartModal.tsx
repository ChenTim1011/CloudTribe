import React, { useState } from 'react'; // 添加 useState
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import CheckoutForm from "@/components/buyer/CheckoutForm";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
};

type CartModalProps = {
  cart: CartItem[];
  onClose: () => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartModal: React.FC<CartModalProps> = ({ cart, onClose, removeFromCart, updateQuantity, clearCart }) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-xl">
        <SheetHeader>
          <SheetTitle>購物車 ({cart.reduce((total, item) => total + item.quantity, 0)})</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center mb-4 bg-white p-4 rounded shadow">
              <img src={item.img} alt={item.name} className="w-16 h-16 object-cover mr-4" />
              <div className="flex-grow">
                <h2 className="text-lg font-bold truncate" style={{ maxWidth: "12rem" }}>{item.name}</h2>
                <p>${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</p>
                <div className="flex items-center">
                  <Button variant="outline" onClick={() => updateQuantity(item.id, -1)}>-</Button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) - item.quantity)}
                    className="w-12 text-center mx-2 border rounded"
                    min={1}
                  />
                  <Button variant="outline" onClick={() => updateQuantity(item.id, 1)}>+</Button>
                </div>
              </div>
              <Button variant="outline" className="bg-black text-white ml-2" onClick={() => removeFromCart(item.id)}>
                <FontAwesomeIcon icon={faTrashAlt} className="text-white" />
              </Button>
            </div>
          ))}
          <div className="text-right font-bold text-xl">總計: ${total.toFixed(2)}</div>
        </div>
        <SheetFooter>
          <Button className="bg-black text-white" onClick={() => setIsCheckout(true)}>結帳</Button>
        </SheetFooter>
      </SheetContent>
      {isCheckout && <CheckoutForm onClose={() => { setIsCheckout(false); onClose(); }} clearCart={clearCart} />}
    </Sheet>
  );
};

export default CartModal;

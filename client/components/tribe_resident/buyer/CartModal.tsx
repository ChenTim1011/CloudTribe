import React, { useState } from 'react'; 
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import CheckoutForm from "@/components/tribe_resident/buyer/CheckoutForm";

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
  cartItems: CartItem[];
  totalPrice: number;
};

/**
 * Represents a modal component for the shopping cart.
 * @param cart - The array of items in the cart.
 * @param onClose - The function to close the modal.
 * @param removeFromCart - The function to remove an item from the cart.
 * @param updateQuantity - The function to update the quantity of an item in the cart.
 * @param clearCart - The function to clear the cart.
 * @param cartItems - The number of items in the cart.
 * @param totalPrice - The total price of all items in the cart.
 */
const CartModal: React.FC<CartModalProps> = ({ cart, onClose, removeFromCart, updateQuantity, clearCart, cartItems, totalPrice }) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const [error, setError] = useState("");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0 || total <= 0) {
      setError("購物車為空或總金額為零，無法結帳。");
      return;
    }
    setIsCheckout(true);
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-xl overflow-y-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>購物車結帳 ({cart.reduce((total, item) => total + item.quantity, 0)})</SheetTitle>
        </SheetHeader>
        <div className="p-4">
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center mb-4 bg-white p-4 rounded shadow">
              <img 
                src={`https://www.cloudtribe.online${item.img}`}
                alt={item.name} 
                width={64} 
                height={64} 
                className="object-cover mr-4"
              />
              
              <div className="flex-grow">
                <h2 className="text-lg font-bold truncate" style={{ maxWidth: "12rem" }}>{item.name}</h2>
                <p>${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => updateQuantity(item.id, -1)}>-</Button>
                  <input
                    title="Quantity"
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
          <div className="text-right font-bold text-xl">總計: ${totalPrice.toFixed(2)}</div>
        </div>
        <SheetFooter>
          <Button 
            className="bg-black text-white" 
            onClick={() => {
              if (totalPrice > 0) {
                setIsCheckout(true);
              } else {
                alert('購物車中沒有商品或總價為0');
              }
            }}
          >
            結帳
          </Button>
        </SheetFooter>
      </SheetContent>
      {isCheckout && <CheckoutForm onClose={() => { setIsCheckout(false); onClose(); }} clearCart={clearCart} cartItems={cartItems} totalPrice={totalPrice} />}
    </Sheet>
  );
};

export default CartModal;

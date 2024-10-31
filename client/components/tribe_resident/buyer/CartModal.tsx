import React, { useState } from 'react'; 
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { CartItem } from "@/interfaces/tribe_resident/buyer/CartItem";
import { CartModalProps } from '@/interfaces/tribe_resident/buyer/CartModalProps';
import CheckoutForm from "@/components/tribe_resident/buyer/CheckoutForm";

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
            <React.Fragment key={item.id}>
            <div className="relative flex items-center mb-4 bg-white p-4 rounded shadow">
              <Button 
                variant="outline" 
                className="absolute top-0 left-0 w-6 h-6 bg-black text-white p-1" 
                onClick={() => removeFromCart(item.id)}
              >
                <FontAwesomeIcon icon={faTrashAlt} className="text-white text-xs" />
              </Button>
                <img 
                  src={`https://www.cloudtribe.online${item.img}`}
                  alt={item.name} 
                  width={64} 
                  height={64} 
                  className="object-cover mr-4"
                />
                
                <div className="flex-grow">
                  <h2 className="text-left text-g font-bold truncate" style={{ maxWidth: "12rem" }}>{item.name}</h2>
                  <h2 className="text-g font-bold truncate" style={{ maxWidth: "12rem" }}> 地點: {item.location}</h2>
                  <p> {item.price} 元 x {item.quantity} = {(item.price * item.quantity)} 元</p>
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
              </div>
            </React.Fragment>
          ))}
          <div className="flex justify-between items-center font-bold text-xl">
            <span>總計: ${totalPrice}</span>
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
          </div>
        </div>
        <SheetFooter>
   


        </SheetFooter>
      </SheetContent>
      {isCheckout && <CheckoutForm onClose={() => { setIsCheckout(false); onClose(); }} clearCart={clearCart} cartItems={cartItems} totalPrice={totalPrice} />}
    </Sheet>
  );
};

export default CartModal;

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
};

const CartModal: React.FC<CartModalProps> = ({ cart, onClose, removeFromCart, updateQuantity }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>購物車 ({cart.length})</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg">
              <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 ml-4">
                <h2 className="text-lg font-bold">{item.name}</h2>
                <p className="text-gray-600">{`$${item.price} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`}</p>
              </div>
              <div className="flex items-center">
                <Button variant="outline" className="mr-2" onClick={() => updateQuantity(item.id, -1)}>
                  <FontAwesomeIcon icon={faMinus} />
                </Button>
                <input
                  type="number"
                  className="w-12 text-center border rounded"
                  value={item.quantity}
                  readOnly
                  title={`Quantity: ${item.quantity}`}
                />
                <Button variant="outline" className="ml-2" onClick={() => updateQuantity(item.id, 1)}>
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
                <Button variant="destructive" className="ml-4" onClick={() => removeFromCart(item.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex justify-between p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-lg font-bold">總計:</h2>
            <p className="text-lg font-bold text-red-500">{`$${total.toFixed(2)}`}</p>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" onClick={onClose}>
              關閉
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartModal;

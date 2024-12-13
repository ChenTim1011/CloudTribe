"use client";

import React, { useState } from 'react'; 
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { CartModalProps } from '@/interfaces/tribe_resident/buyer/buyer';
import CheckoutForm from "@/components/tribe_resident/buyer/CheckoutForm";

/**
 * Represents a modal component for displaying and managing the shopping cart.
 * @param {Array} cart - The array of items in the cart.
 * @param {Function} onClose - The function to close the modal.
 * @param {Function} removeFromCart - The function to remove an item from the cart.
 * @param {Function} updateQuantity - The function to update the quantity of an item in the cart.
 * @param {Function} clearCart - The function to clear the entire cart.
 * @param {number} cartItems - The total number of items in the cart.
 * @param {number} totalPrice - The total price of all items in the cart.
 */
const CartModal: React.FC<CartModalProps> = ({ cart, onClose, removeFromCart, updateQuantity, clearCart, cartItems, totalPrice }) => {
  // State to determine if the checkout process is initiated
  const [isCheckout, setIsCheckout] = useState(false);
  
  // State to manage and display error messages
  const [error, setError] = useState("");
  
  // Calculate the total price of all items in the cart
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-xl overflow-y-auto max-h-[80vh]">
        <SheetHeader>
          {/* Display the total number of items in the cart */}
          <SheetTitle>購物車結帳 ({cart.reduce((total, item) => total + item.quantity, 0)})</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          {/* Display any error messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Loop through each item in the cart and render them */}
          {cart.map((item) => (
            <React.Fragment key={item.id}>
              <div className="relative flex items-center mb-4 bg-white p-4 rounded shadow">
                {/* Button to remove an item from the cart */}
                <Button 
                  variant="outline" 
                  className="absolute top-0 left-0 w-6 h-6 bg-black text-white p-1" 
                  onClick={() => removeFromCart(item.id)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="text-white text-xs" />
                </Button>
                
                {/* Item image */}
                <img 
                  src={
                        item.category === "小木屋鬆餅" || item.category === "金鰭" || item.category === "原丼力"
                        ? `/test/${encodeURIComponent(item.img)}` // Local image from the public folder
                        : `https://www.cloudtribe.online${item.img}` // Online image URL
                      }
                  alt={item.name} 
                  width={64} 
                  height={64} 
                  className="object-cover mr-4"
                />
                
                <div className="flex-grow">
                  {/* Item name and location */}
                  <h2 className="text-left font-bold break-words">
                    {item.name.split('(').map((part, index, array) => (
                      <React.Fragment key={index}>
                        {index === 0 ? (
                          <span className="block text-lg">{part}</span>
                        ) : (
                          <span className="block text-sm text-gray-600">({part}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </h2>
                  <h2 className="text-g font-bold truncate" style={{ maxWidth: "12rem" }}> 地點: {item.location}</h2>
                  
                  {/* Item price and quantity */}
                  <p> {item.price} 元 x {item.quantity} = {(item.price * item.quantity)} 元</p>
                  <div className="flex items-center justify-between">
                    {/* Buttons to update the item quantity */}
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

          {/* Display the total price and a checkout button */}
          <div className="flex justify-between items-center font-bold text-xl">
            <span>總計: {totalPrice} 元 </span>         
            <Button 
              className="bg-black text-white" 
              onClick={() => {
                if (totalPrice > 0) {
                  // Initiate the checkout process
                  setIsCheckout(true);
                } else {
                  alert('購物車中沒有商品或總價為0');
                }
              }}
            >
              結帳
            </Button>
          </div>
          <span className="text-sm text-gray-500 font-normal">
              (這裡為參考價格，實際價格以司機拿發票為主)
            </span>
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>

      {/* Render the checkout form if the checkout process is initiated */}
      {isCheckout && <CheckoutForm onClose={() => { setIsCheckout(false); onClose(); }} clearCart={clearCart} cartItems={cartItems} totalPrice={totalPrice} />}
    </Sheet>
  );
};

export default CartModal;

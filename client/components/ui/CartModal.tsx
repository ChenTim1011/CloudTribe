import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from 'shadcn-ui';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartModalProps = {
  cart: CartItem[];
  onClose: () => void;
  removeFromCart: (id: string) => void; 
};

const CartModal: React.FC<CartModalProps> = ({ cart, onClose ,  removeFromCart }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);



  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>購物車</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <button onClick={() => removeFromCart(item.id)}>取消購買</button>
            </div>
          ))}
          <div className="cart-total">總計: ${total.toFixed(2)}</div>
        </ModalBody>
        <ModalFooter>
          <button>提交訂單</button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CartModal;

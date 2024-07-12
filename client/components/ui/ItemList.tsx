import React, { useEffect, useState } from 'react';
import data from '../../../database/data.json';
import CartModal from './CartModal'; 

  
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

/**
 * Renders a list of items with the ability to add items to a shopping cart.
 */
const ItemList: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    /**
     * Adds an item to the shopping cart.
     * @param productId - The ID of the product.
     * @param productName - The name of the product.
     * @param productPrice - The price of the product.
     */
    const addToCart = (productId: string, productName: string, productPrice: number) => {
        const quantity = parseInt((document.getElementById(`quantity-${productId}`) as HTMLInputElement)?.value || '1', 10);
        const product: CartItem = { id: productId, name: productName, price: productPrice, quantity };
        const existingProductIndex = cart.findIndex(item => item.id === product.id);


        if (existingProductIndex !== -1) {
            const updatedCart = [...cart];
            updatedCart[existingProductIndex].price += product.price * quantity;
            setCart(updatedCart);
        } else {
            setCart([...cart, product]);
        }

        alert('商品已加入購物車');
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    return (
        <div>
          <h1>商品展示</h1>
          <div className="groupItems">
            {data.map(item => (
              <div key={item.id} className="item">
                <div className="box-img">
                  <img src={item.img} alt={item.name} />
                </div>
                <div className="description">{item.name}</div>
                <div className="price">售價: ${item.price}</div>
                <div className="order">
                  數量：
                  <input type="number" id={`quantity-${item.id}`} min="1" defaultValue="1" /><br />
                  <button onClick={() => addToCart(item.id, item.name, item.price)}>
                    <i className="fas fa-shopping-cart"></i>購物車
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setIsCartOpen(true)}>查看購物車</button>
          {isCartOpen && (
            <CartModal cart={cart} onClose={() => setIsCartOpen(false)} removeFromCart={removeFromCart} />
          )}
        </div>
      );
    };
};
  
  export default ItemList;
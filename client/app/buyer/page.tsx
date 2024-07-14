"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/buyer/Sidebar";
import SearchBar from "@/components/buyer/SearchBar";
import ItemList from "@/components/buyer/ItemList";
import CartModal from "@/components/buyer/CartModal";
import "@/app/styles/globals.css";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

type Product = {
  category: string;
  img: string;
  id: string;
  name: string;
  price: number; 
};

type CartItem = Product & {
  quantity: number;
};

const ITEMS_PER_PAGE = 16;

const BuyerPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Product[] = await response.json();
        console.log('Loaded products:', data);
        setProducts(data);
        setInitialLoad(false);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilterCategory = useCallback(
    (category: string) => {
      console.log("Selected Category:", category);
      const filtered = products.filter((product) => product.category === category);
      console.log("Filtered products:", filtered);
      setFilteredProducts(filtered);
      setSelectedCategory(category);
    },
    [products]
  );

  const handleSearch = useCallback(
    (query: string) => {
      console.log("Search query:", query);
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
      setSelectedCategory(null);
    },
    [products]
  );

  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(item.quantity + quantity, 1) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div
      className="flex h-screen"
      style={{
        backgroundImage: "url('/eat.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 1, 
        height: '400px', 
      }}
    >
      <div className="content flex-grow p-10 bg-white bg-opacity-80 flex flex-col items-center">
        <h1 className="mb-20 text-4xl font-bold text-center">今天我想要來點...</h1>
        <div className="flex justify-center w-full mb-10">
          <SearchBar onSearch={handleSearch} className="w-1/2" />
        </div>
        <div className="flex justify-center w-full mb-10">
          <Sidebar filterCategory={handleFilterCategory} className="w-1/2" />
        </div>
        {selectedCategory && (
          <div className="mt-10 text-2xl font-semibold text-center">
            商品種類: {selectedCategory}
          </div>
        )}
        {!initialLoad && filteredProducts.length > 0 && (
          <ItemList products={filteredProducts} itemsPerPage={ITEMS_PER_PAGE} addToCart={handleAddToCart} />
        )}
        <div className="fixed top-4 right-4">
          <Button variant="outline" onClick={() => setIsCartOpen(true)}>
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
            {`購物車 (${cart.reduce((total, item) => total + item.quantity, 0)})`}
          </Button>
        </div>
        {isCartOpen && (
          <CartModal
            cart={cart}
            onClose={() => setIsCartOpen(false)}
            removeFromCart={handleRemoveFromCart}
            updateQuantity={handleUpdateQuantity}
            clearCart={clearCart}
          />
        )}
      </div>
    </div>
  );
};

export default BuyerPage;

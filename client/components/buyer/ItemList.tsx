"use client";

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import PaginationDemo from "@/components/buyer/PaginationDemo";
import { Button } from "@/components/ui/button"; 

type Product = {
  category: string;
  img: string;
  id: string;
  name: string;
  price: string;
};

type ItemListProps = {
  products: Product[];
  itemsPerPage: number;
};

const ItemList: React.FC<ItemListProps> = ({ products, itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentData = products.slice(startIdx, endIdx);

  const handleAddToCart = (id: string, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevCart, { id, quantity }];
      }
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentData.map((product) => (
          <div key={product.id} className="card p-4 bg-white shadow-md rounded-lg">
            <img src={product.img} alt={product.name} className="w-full h-48 object-cover" style={{ height: '250px', objectFit: 'contain' }} />
            <div className="p-4 text-center">
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              <p className="text-2xl font-bold text-red-500 mb-4">參考價格: ${product.price}</p>
              <div className="flex justify-center items-center mb-4">
                <label htmlFor={`quantity-${product.id}`} className="mr-2">購買數量:</label>
                <input
                  type="number"
                  id={`quantity-${product.id}`}
                  className="w-16 text-center border rounded"
                  defaultValue={1}
                  min={1}
                />
              </div>
                <div className="flex justify-center">
                  <Button
                    className="flex items-center justify-center"
                    onClick={() => {
                      const quantity = parseInt((document.getElementById(`quantity-${product.id}`) as HTMLInputElement)?.value || '1', 10);
                      handleAddToCart(product.id, quantity);
                    }}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                    加入購物車
                  </Button>
                </div>
            </div>
          </div>
        ))}
      </div>
      <PaginationDemo
        totalItems={products.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ItemList;

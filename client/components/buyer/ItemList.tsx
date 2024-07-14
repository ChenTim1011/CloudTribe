"use client";

import React, { useState } from 'react';
import PaginationDemo from "@/components/buyer/PaginationDemo";

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentData = products.slice(startIdx, endIdx);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentData.map((product) => (
          <div key={product.id} className="card">
            <img src={product.img} alt={product.name} className="w-full h-48 object-cover"style={{ height: '250px', objectFit: 'contain' }}  />
            <div className="p-4">
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="text-lg text-red-500">參考價格:${product.price}</p>
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

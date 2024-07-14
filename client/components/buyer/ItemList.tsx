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
            <img src={product.img} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-bold">{product.name}</h2>
              <p className="text-gray-600">{product.category}</p>
              <p className="text-red-500">${product.price}</p>
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

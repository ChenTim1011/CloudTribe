"use client";

import React, { useState, useCallback } from "react";
import Sidebar from "@/components/buyer/Sidebar";
import SearchBar from "@/components/buyer/SearchBar";
import "@/app/styles/globals.css";

type Product = {
  category: string;
  img: string;
  id: string;
  name: string;
  price: string;
};

const initialProducts: Product[] = [
  {
    category: "食用油",
    img: "https://online.carrefour.com.tw/dw/image/v2/BFHC_PRD/on/demandware.static/-/Sites-carrefour-tw-m-inner/default/dwd825486d/images/large/1461100100101_NR_00.png?sw=300&bgcolor=FFFFFF",
    id: "1461100100101",
    name: "泰山活力元素葵花油1.5L",
    price: "249.0",
  },
  // 添加其他商品数据...
];

const BuyerPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);

  const handleFilterCategory = useCallback(
    (category: string) => {
      console.log("Selected Category:", category);
      const filtered = products.filter((product) => product.category === category);
      setFilteredProducts(filtered);
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
    },
    [products]
  );

  return (
    <div className="flex">
      <div className="content flex-grow p-10">
        <h1 className="mb-4">今天我想要來點...</h1>
        <SearchBar onSearch={handleSearch} className="mb-4" />
        <Sidebar filterCategory={handleFilterCategory} className="mb-4" />
        <ProductList products={filteredProducts} />
      </div>
    </div>
  );
};

type ProductListProps = {
  products: Product[];
};

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
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
  );
};

export default BuyerPage;

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/buyer/Sidebar";
import SearchBar from "@/components/buyer/SearchBar";
import ItemList from "@/components/buyer/ItemList";
import "@/app/styles/globals.css";

type Product = {
  category: string;
  img: string;
  id: string;
  name: string;
  price: string;
};

const ITEMS_PER_PAGE = 16; // 每页显示的商品数量

const BuyerPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Product[] = await response.json();
        console.log('Loaded products:', data); // 调试日志
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
      console.log("Filtered products:", filtered); // 调试日志
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

  return (
    <div
      className="flex h-screen"
      style={{
        backgroundImage: "url('/eat.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="content flex-grow p-10 bg-white bg-opacity-80">
        <h1 className="mb-4 text-4xl font-bold">今天我想要來點...</h1>
        <SearchBar onSearch={handleSearch} className="mb-4" />
        <Sidebar filterCategory={handleFilterCategory} className="mb-4" />
        {selectedCategory && (
          <div className="mt-4 text-2xl font-semibold">
            商品種類: {selectedCategory}
          </div>
        )}
        {!initialLoad && filteredProducts.length > 0 && (
          <ItemList products={filteredProducts} itemsPerPage={ITEMS_PER_PAGE} />
        )}
      </div>
    </div>
  );
};

export default BuyerPage;

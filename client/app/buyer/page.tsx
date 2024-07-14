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

const ITEMS_PER_PAGE = 16; 

const BuyerPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);


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
          <SearchBar onSearch={handleSearch} className="mb-10 w-1/2" />
          <Sidebar filterCategory={handleFilterCategory} className="mb-10 w-1/2" />
        {selectedCategory && (
          <div className="mt-10 text-2xl font-semibold">
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

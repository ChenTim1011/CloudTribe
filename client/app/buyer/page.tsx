"use client";

import React, { useCallback } from 'react';
import Sidebar from '@/components/buyer/Sidebar';
import SearchBar from '@/components/buyer/SearchBar';
import '@/app/styles/globals.css'; 




const BuyerPage: React.FC = () => {
  const handleFilterCategory = useCallback((category: string) => {
    console.log('Selected Category:', category);
  }, []);

  const handleSearch = useCallback((query: string) => {
    console.log('Search query:', query);
    // Add search logic here
  }, []);

  return (
    <div className="flex">
      <Sidebar filterCategory={handleFilterCategory} />
      {/*  add other contents   */}
      <div className="content flex-grow p-10">
        <SearchBar onSearch={handleSearch} />
        {/* add other contents */}
      </div>
    </div>
  );
};

export default BuyerPage;

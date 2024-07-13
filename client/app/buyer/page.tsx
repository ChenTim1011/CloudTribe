"use client";

import React, { useCallback } from 'react';
import Sidebar from '@/components/buyer/Sidebar';
import '@/app/styles/globals.css'; 




const BuyerPage: React.FC = () => {
  const handleFilterCategory = useCallback((category: string) => {
    console.log('Selected Category:', category);
  }, []);

  return (
    <div className="flex">
      <Sidebar filterCategory={handleFilterCategory} />
      {/*  add other contents   */}
      <div className="content flex-grow p-10">
        {/* add other contents */}
      </div>
    </div>
  );
};

export default BuyerPage;

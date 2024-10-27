"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart,faDollarSign, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import PaginationDemo from "@/components/tribe_resident/buyer/PaginationDemo";
import { Button } from "@/components/ui/button";


type Product = {
  category: string;
  img: string;
  id: string;
  name: string;
  price: number;
};

type ItemListProps = {
  products: Product[];
  itemsPerPage: number;
  addToCart: (product: Product, quantity: number) => void;
};

/**
 * Renders a list of items with pagination and sorting functionality.
 *
 * @param products - The array of products to display.
 * @param itemsPerPage - The number of items to display per page.
 * @param addToCart - The function to add a product to the cart.
 */
const ItemList: React.FC<ItemListProps> = ({ products, itemsPerPage, addToCart }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedProducts, setSortedProducts] = useState<Product[]>(products);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    // Sort the products based on the current sort order.
    const sorted = [...products].sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
    setSortedProducts(sorted);
  }, [products, sortOrder]);

  /**
   * Handles the page change event.
   *
   * @param page - The new page number.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Toggles the sort order between ascending and descending.
   */
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentData = sortedProducts.slice(startIdx, endIdx);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={toggleSortOrder}>
          <FontAwesomeIcon icon={faSortAmountDown} className="mr-2" />
          {sortOrder === 'asc' ? '價格由小到大' : '價格由大到小'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentData.map((product) => (
          <div key={product.id} className="card p-4 bg-white shadow-md rounded-lg">
            <img 
	      src={`https://www.cloudtribe.online${product.img}`}
              alt={product.name} 
              width={250} 
              height={250} 
              className="object-cover"
              style={{ objectFit: 'contain' }}
            />
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
              <div className="flex flex-col items-center">
                {/* 加入購物車按鈕 */}
                <Button
                  className="flex items-center justify-center"
                  onClick={() => {
                    const quantity = parseInt((document.getElementById(`quantity-${product.id}`) as HTMLInputElement)?.value || '1', 10);
                    addToCart(product, quantity);
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                  加入購物車
                </Button>

                {/* 商品連結按鈕 */}
                <a 
                  href={`https://online.carrefour.com.tw/zh/search/?q=${product.name.replace(/\(.*?\)|※.*$|因.*$/g, '').trim()}`}   
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4"
                >
                  <Button className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-2" /> {/* 金錢 icon */}
                    商品連結(目前的實際價格)
                  </Button>
                </a>
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

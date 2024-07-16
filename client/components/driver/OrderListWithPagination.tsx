import React, { useState } from 'react';
import OrderCard from './OrderCard';
import PaginationDemo from './PaginationDemo';


const OrderListWithPagination: React.FC<{ orders: any[], onAccept: (orderId: string) => void }> = ({ orders, onAccept }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {currentOrders.map(order => (
        <OrderCard key={order.id} order={order} onAccept={onAccept} />
      ))}
      <PaginationDemo
        totalItems={orders.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default OrderListWithPagination;

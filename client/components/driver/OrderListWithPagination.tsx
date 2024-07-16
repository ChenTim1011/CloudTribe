import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import PaginationDemo from './PaginationDemo';

const OrderListWithPagination: React.FC<{ orders: any[], onAccept: (orderId: string) => void, driverData: any }> = ({ orders, onAccept, driverData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const itemsPerPage = 5;

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {currentOrders.length > 0 ? (
        currentOrders.map(order => (
          <OrderCard key={order.id} order={order} onAccept={onAccept} />
        ))
      ) : (
        <p className="text-center">沒有符合的訂單。</p>
      )}
      <PaginationDemo
        totalItems={filteredOrders.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default OrderListWithPagination;

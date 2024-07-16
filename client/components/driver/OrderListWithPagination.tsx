import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import PaginationDemo from './PaginationDemo';
import { Button } from '@/components/ui/button';

const OrderListWithPagination: React.FC<{ orders: any[], onAccept: (orderId: string) => void, driverData: any }> = ({ orders, onAccept, driverData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const filterOrders = () => {
    const { available_date, start_time, end_time } = driverData;
    const filtered = orders.filter(order => {
      const orderDateTime = new Date(`${order.date}T${order.time}:00`);
      const driverStartDateTime = new Date(`${available_date}T${start_time}:00`);
      const driverEndDateTime = new Date(`${available_date}T${end_time}:00`);
      return orderDateTime > driverStartDateTime 
    });
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={filterOrders} className="bg-black text-white">篩選表單</Button>
      </div>
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

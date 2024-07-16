import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import PaginationDemo from './PaginationDemo';
import { Button } from '@/components/ui/button';

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

  const handleAcceptOrder = async (orderId: string) => {
    try {
      if (!driverData || !driverData.id) {
        console.error("Driver data is missing or incomplete");
        return;
      }

      const response = await fetch(`/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          driver_id: driverData.id,
          order_id: orderId,  
          action: "accept"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to accept order: ${errorText}`);
      }

      setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
      alert('接單成功');
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('接單失敗');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {currentOrders.length > 0 ? (
        currentOrders.map(order => (
          <OrderCard key={order.id} order={order} onAccept={handleAcceptOrder} />
        ))
      ) : (
        <p className="text-center mt-8">沒有符合的訂單。</p>
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

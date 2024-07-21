import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import PaginationDemo from './PaginationDemo';

const OrderListWithPagination: React.FC<{ orders: any[], onAccept: (orderId: string) => void, onTransfer: (orderId: string, newDriverPhone: string) => void, onNavigate: (orderId: string) => void, driverData: any, onOrderAccepted: () => void }> = ({ orders, onAccept, onTransfer, onNavigate, driverData, onOrderAccepted }) => {
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
        console.log("handleAcceptOrder called with orderId:", orderId);
        console.log("Accepting order with driverData:", driverData);
        if (!driverData || !driverData.id) {
            console.error("Driver data is missing or incomplete");
            return;
        }

        const timestamp = new Date().toISOString();

        const response = await fetch(`/api/orders/${orderId}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                driver_id: driverData.id,
                order_id: orderId,
                action: "接單",
                timestamp: timestamp,
                previous_driver_id: null,
                previous_driver_name: null,
                previous_driver_phone: null
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to accept order: ${errorText}`);
        }

        const acceptedOrder = await response.json();
        console.log("Accepted Order:", acceptedOrder);

        setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
        alert('接單成功');
        onOrderAccepted(); // Notify parent component that an order has been accepted
    } catch (error) {
        console.error('Error accepting order:', error);
        alert('接單失敗');
    }
};

const handleTransferOrder = async (orderId: string, newDriverPhone: string) => {
  try {
      const response = await fetch(`/api/orders/${orderId}/transfer`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              current_driver_id: driverData.id,
              new_driver_phone: newDriverPhone,
          }),
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to transfer order: ${errorText}`);
      }

      setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
      alert('轉單成功');
  } catch (error) {
      console.error('Error transferring order:', error);
      alert('轉單失敗');
  }
};

  const handleNavigate = async (orderId: string) => {
    // Implement the logic to navigate to the order location
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {currentOrders.length > 0 ? (
        currentOrders.map(order => (
          <OrderCard key={order.id} order={order} onAccept={handleAcceptOrder} onTransfer={handleTransferOrder} onNavigate={handleNavigate} />
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

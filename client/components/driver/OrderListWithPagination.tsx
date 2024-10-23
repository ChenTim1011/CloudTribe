import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import PaginationDemo from './PaginationDemo';

interface OrderListWithPaginationProps {
    orders: any[];
    onAccept: (orderId: string) => Promise<void>;
    onTransfer: (orderId: string, newDriverPhone: string) => Promise<void>;
    onNavigate: (orderId: string, driverId: number) => void;
    onComplete: (orderId: string) => Promise<void>;
    driverId: number;
}

/**
 * Renders a list of orders with pagination.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array} props.orders - The list of orders to display.
 * @param {Function} props.onAccept - The function to handle accepting an order.
 * @param {Function} props.onTransfer - The function to handle transferring an order.
 * @param {Function} props.onNavigate - The function to handle navigating to an order.
 * @param {Function} props.onComplete - The function to handle completing an order.
 * @param {string} props.driverId - The ID of the driver.
 * @returns {JSX.Element} The rendered component.
 */
const OrderListWithPagination: React.FC<OrderListWithPaginationProps> = ({ orders, onAccept, onTransfer, onNavigate, onComplete, driverId }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const itemsPerPage = 5;

    useEffect(() => {
        console.log('Received orders:', orders);
        setFilteredOrders(orders);
    }, [orders]);

    /**
     * Handles the page change event.
     *
     * @param {number} page - The new page number.
     */
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

 return (
     <div>
         {currentOrders.length > 0 ? (
             currentOrders.map(order => {
                 console.log('Rendering order:', order); // 檢查每個訂單
                 return (
                     <OrderCard
                         key={order.id}
                         order={order}
                         driverId={driverId}
                         onAccept={onAccept}
                         onTransfer={onTransfer}
                         onNavigate={onNavigate}
                         onComplete={onComplete}
                     />
                 );
             })
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

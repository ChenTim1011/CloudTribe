import React, { useState, useEffect,useMemo } from 'react'; 
import OrderCard from './OrderCard';
import PaginationDemo from './PaginationDemo';
import { Order } from '@/interfaces/tribe_resident/buyer/order';

interface OrderListWithPaginationProps {
    orders: Order[];
    onAccept: (orderId: string, service: string) => Promise<void>;
    onTransfer: (orderId: string, newDriverPhone: string) => Promise<void>;
    onNavigate: (orderId: string) => void;
    onComplete: (orderId: string, service: string) => Promise<void>;
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
    const itemsPerPage = 5;

    /**
     * Handles the page change event.
     *
     * @param {number} page - The new page number.
     */
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Sort orders by urgency
    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) => {
            // First, compare urgency
            if (a.is_urgent !== b.is_urgent) {
                return a.is_urgent ? -1 : 1;
            }
            
            // If urgency is the same, compare location
            if (a.location === b.location) {
                return 0;
            }
            
            // If urgency is the same, sort by location
            return a.location.localeCompare(b.location);
        });
    }, [orders]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div>
            {currentOrders.length > 0 ? (
                currentOrders.map(order => {
                    return (
                        <OrderCard
                            key={order.id}
                            order={order}
                            driverId={driverId}
                            onAccept={onAccept}
                            onTransfer={onTransfer}
                            onComplete={onComplete}
                        />
                    );
                })
            ) : (
                <p className="text-center mt-8">沒有符合的訂單。</p>
            )}
            <PaginationDemo
                totalItems={sortedOrders.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default OrderListWithPagination;

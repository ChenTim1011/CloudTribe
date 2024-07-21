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

const OrderListWithPagination: React.FC<OrderListWithPaginationProps> = ({ orders, onAccept, onTransfer, onNavigate, onComplete, driverId }) => {
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
                    <OrderCard
                        key={order.id}
                        order={order}
                        driverId={driverId}
                        onAccept={onAccept}
                        onTransfer={onTransfer}
                        onNavigate={onNavigate}
                        onComplete={onComplete}
                    />
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

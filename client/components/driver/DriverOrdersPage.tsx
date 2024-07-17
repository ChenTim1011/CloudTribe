import React, { useEffect, useState } from 'react';
import OrderCard from './OrderCard'; // Assuming you already have OrderCard component

const DriverOrdersPage: React.FC<{ driverData: any }> = ({ driverData }) => {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!driverData || !driverData.id) {
            console.error("Driver data is missing or incomplete");
            return;
        }

        const fetchDriverOrders = async () => {
            try {
                const response = await fetch(`/api/drivers/${driverData.id}/orders`);
                if (!response.ok) {
                    throw new Error('Failed to fetch driver orders');
                }
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching driver orders:', error);
            }
        };

        fetchDriverOrders();
    }, [driverData]);

    return (
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <h1 className="text-lg font-bold mb-4">只有找到下一位司機才可以轉單</h1>
            {orders.length > 0 ? (
                orders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onAccept={() => {}}
                        onTransfer={() => {}}
                        onNavigate={() => {}}
                    />
                ))
            ) : (
                <p className="text-center mt-8">目前沒有接到的訂單。</p>
            )}
        </div>
    );
};

export default DriverOrdersPage;

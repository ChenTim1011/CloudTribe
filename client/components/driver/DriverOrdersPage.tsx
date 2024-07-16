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
        <div>
            <h1 className="text-2xl font-bold mb-4">我的訂單</h1>
            {orders.length > 0 ? (
                orders.map(order => (
                    <OrderCard key={order.id} order={order} onAccept={() => {}} />
                ))
            ) : (
                <p className="text-center mt-8">目前沒有接到的訂單。</p>
            )}
        </div>
    );
};

export default DriverOrdersPage;

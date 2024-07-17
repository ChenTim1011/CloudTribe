import React, { useEffect, useState } from 'react';
import OrderCard from './OrderCard';

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

    const handleTransferOrder = async (orderId: string, newDriverPhone: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ current_driver_id: driverData.id, new_driver_phone: newDriverPhone }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to transfer order: ${errorText}`);
            }

            setOrders(orders.filter(order => order.id !== orderId));
            alert('轉單成功');
        } catch (error) {
            console.error('Error transferring order:', error);
            alert('轉單失敗');
        }
    };

    const handleNavigateOrder = async (orderId: string) => {
        
    };

    return (
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <h1 className="text-lg font-bold mb-4">只有找到下一位司機才可以轉單</h1>
            {orders.length > 0 ? (
                orders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onAccept={() => {}}
                        onTransfer={handleTransferOrder}
                        onNavigate={handleNavigateOrder}
                    />
                ))
            ) : (
                <p className="text-center mt-8">目前沒有接到的訂單。</p>
            )}
        </div>
    );
};

export default DriverOrdersPage;

import React, { useEffect, useState } from 'react';
import OrderCard from '@/components/driver/OrderCard';
import { useRouter } from 'next/navigation';

const DriverOrdersPage: React.FC<{ driverData: any }> = ({ driverData }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const router = useRouter();

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
                setOrders(data.filter((order: any) => order.order_status !== '已完成')); // 只顯示未完成的訂單
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
                throw new Error(`轉單失敗: ${errorText}`);
            }

            setOrders(orders.filter(order => order.id !== orderId));
            alert('轉單成功');
        } catch (error) {
            console.error('轉單失敗:', error);
            alert(`${(error as Error).message}`);
        }
    };

    const handleNavigateOrder = (orderId: string) => {
        router.push(`/navigation?orderId=${orderId}&driverId=${driverData.id}`);
    };

    const handleCompleteOrder = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to complete order');
            }

            setOrders(orders.filter(order => order.id !== orderId)); // 直接移除已完成的訂單
            alert('訂單已完成');
        } catch (error) {
            console.error('Error completing order:', error);
            alert('完成訂單失敗');
        }
    };

    return (
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <h1 className="text-lg font-bold mb-4">只有找到下一位司機才可以轉單</h1>
            {orders.length > 0 ? (
                orders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        driverId={driverData.id}
                        onAccept={() => {}}
                        onTransfer={handleTransferOrder}
                        onNavigate={handleNavigateOrder}
                        onComplete={handleCompleteOrder}
                    />
                ))
            ) : (
                <p className="text-center mt-8">目前沒有接到的訂單。</p>
            )}
        </div>
    );
};

export default DriverOrdersPage;

"use client";

import React, { useEffect, useState, useCallback, useMemo , useRef } from 'react';
import OrderCard from '@/components/driver/OrderCard';
import { Order } from '@/interfaces/tribe_resident/buyer/order';
import { Driver } from '@/interfaces/driver/driver';
import { Button } from "@/components/ui/button";


interface DriverOrdersPageProps {
    driverData: Driver;
    onAccept: (orderId: string, service: string) => Promise<void>;
    onTransfer: (orderId: string, newDriverPhone: string) => Promise<void>;
    onComplete: (orderId: string, service: string) => Promise<void>;
}

/**
 * Represents the page component for displaying driver orders.
 * @param {Object} props - The component props.
 * @param {Driver} props.driverData - The driver data.
 * @returns {JSX.Element} - The driver orders page component.
 */
const NavigationDriverOrdersPage: React.FC<DriverOrdersPageProps> = ({ 
    driverData, 
    onAccept, 
    onTransfer, 
    onComplete 
}) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderStatus, setOrderStatus] = useState<string>("接單");
    const [error, setError] = useState<string>("");

    /**
     * Fetches the orders assigned to the driver from the server.
     */
    const fetchDriverOrders = useCallback(async () => {
        try {
            const response = await fetch(`/api/drivers/${driverData.id}/orders`);
            if (!response.ok) {
                throw new Error('Failed to fetch driver orders');
            }
            const data: Order[] = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching driver orders:', error);
            setError('獲取訂單失敗');
        }
    }, [driverData.id]);

    /**
     * Fetch orders when the component mounts or driverData changes.
     */
    useEffect(() => {
        if (!driverData || !driverData.id) {
            console.error("Driver data is missing or incomplete");
            return;
        }

        fetchDriverOrders();
    }, [driverData, fetchDriverOrders]);

    // Handle local transfer of order
    const handleLocalTransfer = async (orderId: string, newDriverPhone: string) => {
        try {
            // Call the transfer API
            await onTransfer(orderId, newDriverPhone);
            // Update the local state
            setOrders(prevOrders => prevOrders.filter(order => order.id !== parseInt(orderId)));
        } catch (error) {
            console.error('Error in handleLocalTransfer:', error);
            setError('轉單失敗，填寫電話號碼的司機未註冊,請重新整理頁面讓表單重新出現');
        }
    };

    // Handle local complete of order
    const handleLocalComplete = async (orderId: string, service: string) => {
        try {
            // Call the complete API
            await onComplete(orderId, service);
            // Update the local state
            setOrders(prevOrders => prevOrders.filter(order => order.id !== parseInt(orderId)));
        } catch (error) {
            console.error('Error in handleLocalComplete:', error);
            setError('完成訂單失敗');
        }
    };



    const finalFilteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus = order.order_status === orderStatus;
            return matchesStatus;
        });
    }, [orders, orderStatus]);

    /**
     * Calculates the total price of the filtered orders.
     */
    const totalPrice = finalFilteredOrders.reduce((total, order) => total + order.total_price, 0);


    return (
        <div className="p-4">
   
            <h1 className="text-lg text-center font-bold mb-4">只有找到下一位司機才可以轉單</h1>

            {/* Filter controls for order status and date range */}
            <div className="mb-4">
                {/* Order status buttons */}
                <div className="flex justify-center space-x-2 mb-2">
                    <Button
                        variant={orderStatus === "接單" ? "default" : "outline"}
                        onClick={() => setOrderStatus("接單")}
                    >
                        接單
                    </Button>
                    <Button
                        variant={orderStatus === "已完成" ? "default" : "outline"}
                        onClick={() => setOrderStatus("已完成")}
                    >
                        已完成
                    </Button>
                </div>

              
             
            </div>


            {/* Display total price if there are filtered orders */}
            {finalFilteredOrders.length > 0 && (
                <div className="flex justify-center mb-4">
                    <span className="text-lg font-bold">總價格: {totalPrice.toFixed(2)} 元</span>
                </div>
            )}

            {/* Display error message if any */}
            {error && <div className="text-red-600 text-center mb-4">{error}</div>}

            {/* Display the list of orders */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {finalFilteredOrders.length > 0 ? (
                    finalFilteredOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            driverId={driverData.id}
                            onAccept={async (orderId: string) => {
                                await onAccept(orderId, order.service);
                            }}
                            onTransfer={(orderId: string, newDriverPhone: string) => handleLocalTransfer(orderId, newDriverPhone)}
                            onComplete={(orderId: string) => handleLocalComplete(orderId, order.service)}
                        />
                    ))
                ) : (
                    <p className="text-center mt-8">目前沒有接到的訂單。</p>
                )}
            </div>
        </div>
    );
};

export default NavigationDriverOrdersPage;

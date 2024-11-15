"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import OrderCard from '@/components/driver/OrderCard';
import { useRouter } from 'next/navigation';
import { Order } from '@/interfaces/tribe_resident/buyer/order';
import { Driver } from '@/interfaces/driver/driver';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

interface DriverOrdersPageProps {
    driverData: Driver;
    onAccept: (orderId: string, service: string) => Promise<void>;
    onTransfer: (orderId: string, newDriverPhone: string) => Promise<void>;
    onNavigate: (orderId: string) => void;
    onComplete: (orderId: string, service: string) => Promise<void>;
}

/**
 * Represents the page component for displaying driver orders.
 * @param {Object} props - The component props.
 * @param {Driver} props.driverData - The driver data.
 * @returns {JSX.Element} - The driver orders page component.
 */
const DriverOrdersPage: React.FC<DriverOrdersPageProps> = ({ driverData, onAccept, onTransfer, onNavigate, onComplete }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const router = useRouter();

    // State variables for order status and date range filtering
    const [orderStatus, setOrderStatus] = useState<string>("接單");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
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

    /**
     *
     * Filters the orders based on the selected status and date range.
     */
    const finalFilteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus = order.order_status === orderStatus;
            return matchesStatus ;
        });
    }, [orders, orderStatus, startDate, endDate]);

    /**
     * Calculates the total price of the filtered orders.
     */
    const totalPrice = finalFilteredOrders.reduce((total, order) => total + order.total_price, 0);

    /**
     * Aggregates all items from the filtered orders, categorized by location.
     */
    const aggregatedItemsByLocation = useMemo(() => {
        const locationMap: { [location: string]: { [itemName: string]: number } } = {};

        finalFilteredOrders.forEach(order => {
            order.items.forEach(item => {
                const location = item.location || "未指定地點"; 
                if (!locationMap[location]) {
                    locationMap[location] = {};
                }
                if (locationMap[location][item.item_name]) {
                    locationMap[location][item.item_name] += item.quantity;
                } else {
                    locationMap[location][item.item_name] = item.quantity;
                }
            });
        });

        // Convert the locationMap object to an array of objects
        const result: { location: string; items: { name: string; quantity: number }[] }[] = [];
        for (const [location, items] of Object.entries(locationMap)) {
            const itemList = Object.entries(items).map(([name, quantity]) => ({ name, quantity }));
            result.push({ location, items: itemList });
        }

        return result;
    }, [finalFilteredOrders]);

    return (
        <div className="p-4">
            <h1 className="text-lg font-bold mb-4">只有找到下一位司機才可以轉單</h1>

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

                {/* Date range picker */}
                <div className="flex justify-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">起始時間</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    {startDate ? format(startDate, "PPP") : "選擇開始日期"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1">
                                <Calendar
                                    mode="single"
                                    selected={startDate || undefined}
                                    onSelect={(day) => setStartDate(day || null)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">終止時間</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    {endDate ? format(endDate, "PPP") : "選擇結束日期"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1">
                                <Calendar
                                    mode="single"
                                    selected={endDate || undefined}
                                    onSelect={(day) => setEndDate(day || null)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            {/* Aggregated Items Button and Popover */}
            <div className="flex overflow-auto justify-center mb-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="secondary">
                            統計所有需要購買的物品
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-4 overflow-auto max-h-80">
                        {aggregatedItemsByLocation.length > 0 ? (
                            <div>
                                <h2 className="text-md font-semibold mb-4">需要購買的物品清單 (按地點分類)</h2>
                                {aggregatedItemsByLocation.map((locationGroup, index) => (
                                    <div key={index} className="mb-4">
                                        <h3 className="text-sm font-medium mb-2">{locationGroup.location}</h3>
                                        <table className="w-full table-auto mb-2">
                                            <thead>
                                                <tr>
                                                    <th className="text-left border-b pb-1">物品名稱</th>
                                                    <th className="text-right border-b pb-1">數量</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {locationGroup.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-1">{item.name}</td>
                                                        <td className="text-right py-1">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>目前沒有需要購買的物品。</p>
                        )}
                    </PopoverContent>
                </Popover>
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
                                console.log(`Order ${orderId} accepted`);
                                await onAccept(orderId, order.service);
                            }}
                            onTransfer={onTransfer}
                            onNavigate={onNavigate}
                            onComplete={onComplete}
                        />
                    ))
                ) : (
                    <p className="text-center mt-8">目前沒有接到的訂單。</p>
                )}
            </div>
        </div>
    );
};

export default DriverOrdersPage;

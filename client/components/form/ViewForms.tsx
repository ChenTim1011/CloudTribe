"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormOrderCard from '@/components/form/FormOrderCard'; 
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { NavigationBar } from "@/components/NavigationBar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

/**
 * Component for viewing forms.
 */
const ViewForms: React.FC = () => {
    /**
     * State variables
     */
    const [role, setRole] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const [showSheet, setShowSheet] = useState(false);
    const [orderStatus, setOrderStatus] = useState<string>('未接單'); // 新增訂單狀態
    const [startDate, setStartDate] = useState<Date | null>(null); // 
    const [endDate, setEndDate] = useState<Date | null>(null); // 新增結束時間

    /**
     * Fetches orders based on role and phone number.
     */
    const handleFetchOrders = useCallback(async () => {
        if (!role || !phone) {
            setError('請選擇角色並輸入電話號碼');
            return;
        }
        setError('');
        try {
            const response = await fetch(`/api/forms?role=${role}&phone=${phone}`);
            if (!response.ok) {
                throw new Error('獲取訂單失敗');
            }
            const data = await response.json();
            setOrders(data);
            setShowSheet(true);
        } catch (err) {
            setError((err as Error).message);
        }
    }, [role, phone]); // Add 'role' and 'phone' as dependencies

    /**
     * Filters orders based on the selected status and time range.
     */
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return order.order_status === orderStatus &&
               (!startDate || orderDate >= startDate) &&
               (!endDate || orderDate <= endDate);
    });

    /**
     * Calculate total price of filtered orders.
     */
    const totalPrice = filteredOrders.reduce((total, order) => total + order.total_price, 0);

    /**
     * Calculate total amount due of filtered orders.
     */
    const totalDue = filteredOrders.reduce((total, order) => total + (order.order_status !== '已結清' ? order.total_price : 0), 0);

    /**
     * Handles accepting an order.
     * @param orderId - The ID of the order to accept.
     */
    const handleAccept = async (orderId: string) => {
        console.log(`Accepting order with ID: ${orderId}`);
    };

    /**
     * Handles transferring an order to a new driver.
     * @param orderId - The ID of the order to transfer.
     * @param newDriverPhone - The phone number of the new driver.
     */
    const handleTransfer = async (orderId: string, newDriverPhone: string) => {
        console.log(`Transferring order with ID: ${orderId} to new driver with phone: ${newDriverPhone}`);
    };

    /**
     * Handles navigating to an order for a driver.
     * @param orderId - The ID of the order to navigate to.
     * @param driverId - The ID of the driver.
     */
    const handleNavigate = async (orderId: string, driverId: number) => {
        console.log(`Navigating to order with ID: ${orderId} for driver ID: ${driverId}`);
    };

    /**
     * Handles completing an order.
     * @param orderId - The ID of the order to complete.
     */
    const handleComplete = async (orderId: string) => {
        console.log(`Completing order with ID: ${orderId}`);
    };

    /**
     * Handles marking an order as paid.
     * @param orderId - The ID of the order to mark as paid.
     */
    const handleMarkAsPaid = async (orderId: string) => {
        console.log(`Marking order with ID: ${orderId} as paid`);
        // Call API to mark the order as paid
        const response = await fetch(`/api/orders/${orderId}/markAsPaid`, { method: 'POST' });
        if (response.ok) {
            setOrders(orders.map(order => order.id === orderId ? { ...order, order_status: '已結清' } : order));
            // Display success message
            alert('確認付款成功');
        } else {
            console.error('Failed to mark order as paid');
            // Optionally, display error message
            alert('付款確認失敗');
        }
    };

    useEffect(() => {
        // Fetch orders again when date range changes
        if (showSheet) {
            handleFetchOrders();
        }
    }, [handleFetchOrders, showSheet]); // 'handleFetchOrders' is now stable

    return (
        <div>
            <NavigationBar />
            <div
                className="flex h-screen"
                style={{
                    backgroundImage: "url('/form.jpg')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 1,
                    height: '400px',
                }}
            >
                <div className="content flex-grow p-10 bg-white bg-opacity-10 flex flex-col items-center">
                    <div className="w-full flex justify-start space-x-2 mt-4">
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            返回主頁
                        </Button>
                    </div>
                    <h1 className="mb-5 text-4xl font-bold text-white text-center" style={{ marginTop: '40px' }}>查看表單</h1>
                    <div className="w-full flex flex-col items-center space-y-4">
                        <div className="mb-4 w-80">
                            <Select onValueChange={setRole} value={role}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="選擇角色" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="seller">賣家</SelectItem>
                                    <SelectItem value="buyer">買家</SelectItem>
                                    <SelectItem value="driver">司機</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4 w-80">
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="輸入您的電話號碼" />
                        </div>
                        <Button className="bg-white text-black w-80" onClick={handleFetchOrders}>表單管理</Button>
                        {error && (
                            <div className="text-red-600 mt-2">{error}</div>
                        )}
                    </div>

                    <Sheet open={showSheet} onOpenChange={setShowSheet}>
                        <SheetContent className="w-full max-w-2xl max-h-[calc(100vh-200px)] overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>訂單詳情</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            {orders.length > 0 && (
                                <>
                                    <div className="w-full flex justify-center space-x-2 mt-4">
                                        <Button variant={orderStatus === '未接單' ? "solid" : "outline" as any} onClick={() => setOrderStatus('未接單')}>未接單</Button>
                                        <Button variant={orderStatus === '接單' ? "solid" : "outline" as any} onClick={() => setOrderStatus('接單')}>接單</Button>
                                        <Button variant={orderStatus === '已完成' ? "solid" : "outline" as any} onClick={() => setOrderStatus('已完成')}>已完成</Button>
                                        <Button variant={orderStatus === '已結清' ? "solid" : "outline" as any} onClick={() => setOrderStatus('已結清')}>已結清</Button>
                                    </div>
                                    <div className="flex justify-center space-x-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">起始時間</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        {startDate ? format(startDate, "PPP") : "選擇開始日期"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={startDate || undefined} onSelect={(day) => setStartDate(day || null)} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">終止時間</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        {endDate ? format(endDate, "PPP") : "選擇結束日期"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={endDate || undefined} onSelect={(day) => setEndDate(day || null)} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div className="w-full flex justify-center mt-4">
                                        <span className="text-lg font-bold">總價格: ${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full flex justify-center mt-2">
                                        <span className="text-lg font-bold">未結清總額: ${totalDue.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            <div className="mt-4">
                                {filteredOrders.map(order => (
                                    <FormOrderCard
                                        key={order.id}
                                        order={order}
                                        role={role} 
                                        driverId={0}
                                        onAccept={handleAccept}
                                        onTransfer={handleTransfer}
                                        onNavigate={handleNavigate}
                                        onComplete={handleComplete}
                                        onMarkAsPaid={handleMarkAsPaid}
                                    />
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    );
};

export default ViewForms;

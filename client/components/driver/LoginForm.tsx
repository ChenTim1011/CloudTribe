"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DriverForm from "./DriverForm";

const LoginForm: React.FC<{ onClose: () => void, onFetchOrders: (phone: string) => void, onFetchDriverData: (data: any) => void, onFilteredOrders: (orders: any[]) => void }> = ({ onClose, onFetchOrders, onFetchDriverData, onFilteredOrders }) => {
    const [phone, setPhone] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [driverData, setDriverData] = useState(null);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        if (!/^\d{7,10}$/.test(phone)) {
            setError("電話號碼長度錯誤");
            return;
        }

        try {
            const response = await fetch(`/api/drivers/${phone}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('電話號碼未註冊');
                }
                throw new Error('電話號碼未註冊');
            }

            const data = await response.json();
            setDriverData(data);
            onFetchDriverData(data);

            const ordersResponse = await fetch(`/api/orders`);
            if (!ordersResponse.ok) {
                throw new Error('Failed to fetch orders');
            }
            const orders = await ordersResponse.json();

            const filteredOrders = filterOrders(orders, data);
            onFilteredOrders(filteredOrders);
            setShowOptions(true);
        } catch (error) {
            console.error('Error fetching driver data:', error);
            setError((error as Error).message || '獲取司機資料時出錯');
        }
    };

    const filterOrders = (orders: any[], driverData: any) => {
        const { available_date, start_time, end_time } = driverData;
        const driverStartDateTime = new Date(`${available_date}T${start_time}:00`);
        const driverEndDateTime = new Date(`${available_date}T${end_time}:00`);
        return orders.filter(order => {
            const orderDateTime = new Date(`${order.date}T${order.time}:00`);
            return orderDateTime > driverEndDateTime;
        }).sort((a, b) => {
            const aDateTime = new Date(`${a.date}T${a.time}:00`).getTime();
            const bDateTime = new Date(`${b.date}T${b.time}:00}`).getTime();
            return aDateTime - bDateTime;
        });
    };

    const handleUpdateInfo = () => {
        setShowUpdateForm(true);
    };

    const handleUseLastCondition = () => {
        onFetchOrders(phone);
        onClose();
    };

    const handleUpdateSuccess = (data: any) => {
        setShowUpdateForm(false);
        setShowOptions(true);
        setDriverData(data);
        onFetchDriverData(data); 
    };

    return (
        <>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {!showOptions ? (
                <>
                    <div className="mb-4">
                        <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="輸入您的電話" />
                    </div>
                    <Button className="bg-black text-white w-full" onClick={handleLogin}>司機選單</Button>
                </>
            ) : !showUpdateForm ? (
                <>
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">司機選單</p>
                    </div>
                    <div className="flex space-x-4">
                        <Button className="bg-black text-white w-full" onClick={handleUpdateInfo}>更新資訊</Button>
                        <Button className="bg-black text-white w-full" onClick={handleUseLastCondition}>查看表單</Button>
                    </div>
                </>
            ) : (
                <DriverForm
                    onClose={() => {
                        setShowUpdateForm(false);
                        setShowOptions(true);
                    }}
                    onUpdateSuccess={handleUpdateSuccess}
                    initialData={driverData}
                />
            )}
        </>
    );
};

export default LoginForm;

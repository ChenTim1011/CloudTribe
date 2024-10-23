"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DriverForm from "./DriverForm";
import UserService from '@/services/user/user';

/**
 * LoginForm component for driver login.
 * @param onClose - Function to close the login form.
 * @param onFetchOrders - Function to fetch orders based on phone number.
 * @param onFetchDriverData - Function to fetch driver data.
 * @param onFilteredOrders - Function to filter orders based on driver data.
 */
const LoginForm: React.FC<{
    onClose: () => void;
    onFetchOrders: (phone: string) => void;
    onFetchDriverData: (data: any) => void;
    onFilteredOrders: (orders: any[]) => void;
}> = ({ onClose, onFetchOrders, onFetchDriverData, onFilteredOrders }) => {
    const [phone, setPhone] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [driverData, setDriverData] = useState<{ id: number; name: string; phone: string; location: string; is_driver: boolean } | null>(null);
    const [error, setError] = useState("");

        // Check if the user is already a driver and bypass the phone login
        useEffect(() => {
            const user = UserService.getLocalStorageUser();
            if (user && user.is_driver) {
                setPhone(user.phone); // Set the phone automatically from local storage
                setShowOptions(true); // Automatically show options if the user is a driver
                setDriverData(user);  // Set driver data from local storage
            }
        }, []);

    /**
     * Handles the login process.
     */
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
            console.log('Driver Information:', data);
            setDriverData(data);
            setShowOptions(true);
            onFetchDriverData(data);
            await filterOrders(data); // Filter orders with the latest driver data
        } catch (error) {
            console.error('Error fetching driver data:', error);
            setError((error as Error).message || '獲取司機資料時出錯');
        }
    };

    /**
     * Handles the update info action.
     */
    const handleUpdateInfo = () => {
        setShowUpdateForm(true);
    };

    /**
     * Handles the use last condition action.
     */
    const handleUseLastCondition = () => {
        onFetchOrders(phone);
        onClose();
    };

    /**
     * Handles the update success event.
     * @param data - Updated driver data.
     */
    const handleUpdateSuccess = async (data: any) => {

        setShowUpdateForm(false);
        onFetchDriverData(data);
    };

    /**
     * Filters orders based on driver data.
     * @param driverData - Driver data used for filtering orders.
     */
    const filterOrders = async (driverData: any) => {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const orders = await response.json();

            const { available_date, start_time, end_time } = driverData;

            console.log('available_date:', available_date);
            console.log('start_time:', start_time);
            console.log('end_time:', end_time);

            const driverStartDateTime = new Date(Date.parse(`${available_date}T${start_time}`));
            const driverEndDateTime = new Date(Date.parse(`${available_date}T${end_time}`));

            console.log('Driver Start DateTime:', driverStartDateTime);
            console.log('Driver End DateTime:', driverEndDateTime);

            const filtered = orders.filter((order: any) => {
                console.log('order.date:', order.date);
                console.log('order.time:', order.time);
                const orderDateTime = new Date(Date.parse(`${order.date}T${order.time}`));
                console.log('Order DateTime:', orderDateTime);
                //test orderDateTime > driverEndDateTime 
                return order.order_status === '未接單';
            }).sort((a: any, b: any) => {
                const aDateTime = new Date(Date.parse(`${a.date}T${a.time}`)).getTime();
                const bDateTime = new Date(Date.parse(`${b.date}T${b.time}`)).getTime();
                return aDateTime - bDateTime;
            });

            console.log('Filtered Orders:', filtered);
            onFilteredOrders(filtered);
        } catch (error) {
            console.error('Error filtering orders:', error);
        }
    };

    return (
        <>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {!showUpdateForm ? (
                <>
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">會根據填寫的時間篩選表單</p>
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
                        setShowOptions(false);
                    }}
                    onUpdateSuccess={handleUpdateSuccess}
                    initialData={driverData}
                />
            )}
        </>
    );
};

export default LoginForm;

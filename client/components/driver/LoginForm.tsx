"use client";


import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DriverForm from "./DriverForm";

const LoginForm: React.FC<{ onClose: () => void, onFetchOrders: (phone: string) => void, onFetchDriverData: (data: any) => void }> = ({ onClose, onFetchOrders, onFetchDriverData }) => {
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
            onFetchDriverData(data); // Pass driver data to parent component
            setShowOptions(true);
        } catch (error) {
            console.error('Error fetching driver data:', error);
            setError(error.message || '獲取司機資料時出錯');
        }
    };

    const handleUpdateInfo = () => {
        setShowUpdateForm(true);
    };

    const handleUseLastCondition = () => {
        onFetchOrders(phone);
        onClose();
    };

    const handleUpdateSuccess = () => {
        setShowUpdateForm(false);
        setShowOptions(true);
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
                        <Button className="bg-black text-white w-full" onClick={handleUseLastCondition}>查看可以接的表單</Button>
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
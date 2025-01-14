"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import UserService from '@/services/user/user'; 
import { Driver } from '@/interfaces/driver/driver';

/**
 * Represents the form for creating or updating a driver.
 * @param onClose - Callback function to close the form.
 * @param onUpdateSuccess - Callback function to handle successful update.
 */
const DriverForm: React.FC<{ onClose: () => void, onUpdateSuccess: (data: Driver) => void}> = ({ onClose, onUpdateSuccess}) => {
    const [name, setName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        // Get user information from local storage and pre-fill it into the form
        const user = UserService.getLocalStorageUser();
        if (user) {
            setName(user.name);  
            setPhone(user.phone); 
        }

    }, );

    /**
     * Handles form submission.
     */
    const handleSubmit = async () => {
        setError("");

        if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(name)) {
            setError("姓名必須填寫而且只能包含中文或英文");
            return;
        }

        if (!/^\d{7,10}$/.test(phone)) {
            setError("電話號碼長度錯誤");
            return;
        }

        

        // check if user is logged in
        const user = UserService.getLocalStorageUser();
        if (!user || user.id === 0) {
            setError("使用者未登入");
            return;
        }

        const driverData = {
            user_id: user.id,
            driver_name: name,
            driver_phone: phone,
        };

        try {
            const response = await fetch('/api/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(driverData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to submit driver data: ${errorText}`);
            }

            const updatedData = await response.json();

            await updateUserToDriver(user.id);


            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
                onUpdateSuccess(updatedData); // Notify parent component that update is successful and pass updated data
                onClose(); // Close the form after successful submission
            }, 1000);
        } catch (error) {
            console.error('Error submitting driver data:', error);
            setError('提交司機資料時出錯，不可以註冊重複的電話號碼');
        }
    };

    // Function to update the user to driver
    const updateUserToDriver = async (userId: number) => {
        try {
            const response = await fetch(`/api/users/driver/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_driver: true })
            });

            if (!response.ok) {
                throw new Error('Failed to update user to driver');
            }

            const user = UserService.getLocalStorageUser();
            const updatedUser = { ...user, is_driver: true };
            UserService.setLocalStorageUser(updatedUser);
        } catch (error) {
            console.error('Error updating user to driver:', error);
        }
    };

    return (
        <>
            {showAlert && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">上傳成功!</strong>
                    <span className="block sm:inline">您的司機資料上傳成功。</span>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="mb-4">
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700">姓名</Label>
                <Input 
                id="name" 
                value={name} 
                readOnly
                className="bg-gray-100 text-gray-500 cursor-not-allowed" 
                onChange={(e) => setName(e.target.value)} 
                placeholder="輸入您的姓名" />
            </div>
            <div className="mb-4">
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話</Label>
                <Input 
                id="phone" 
                value={phone} 
                readOnly 
                className="bg-gray-100 text-gray-500 cursor-not-allowed" 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="輸入您的電話" />
            </div>                                                      

            <Button className="bg-black text-white w-full" onClick={handleSubmit}>{"我確定要當司機"}</Button>
        </>
    );
};

export default DriverForm;

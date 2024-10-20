"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import UserService from '@/services/user/user'; 

/**
 * Represents the form for creating or updating a driver.
 * @param onClose - Callback function to close the form.
 * @param onUpdateSuccess - Callback function to handle successful update.
 * @param initialData - Initial data for pre-filling the form (optional).
 */
const DriverForm: React.FC<{ onClose: () => void, onUpdateSuccess: (data: any) => void, initialData?: any }> = ({ onClose, onUpdateSuccess, initialData }) => {
    const [name, setName] = useState<string>(initialData?.driver_name || "");
    const [phone, setPhone] = useState<string>(initialData?.driver_phone || "");
    const [direction, setDirection] = useState<string | undefined>(initialData?.direction);
    const [date, setDate] = useState<string>(initialData?.available_date || "");
    const [startTime, setStartTime] = useState<string | undefined>(initialData?.start_time);
    const [endTime, setEndTime] = useState<string | undefined>(initialData?.end_time);
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Get user information from local storage and pre-fill it into the form
        const user = UserService.getLocalStorageUser();
        if (user) {
            setName(user.name);  
            setPhone(user.phone); 
        }

        if (initialData) {
            setDirection(initialData.direction);
            setDate(initialData.available_date);
            setStartTime(initialData.start_time);
            setEndTime(initialData.end_time);
        }
    }, [initialData]);

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

        if (!direction) {
            setError("未選擇方向");
            return;
        }

        if (!date) {
            setError("未選擇日期");
            return;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError("選擇的日期不能比今天早");
            return;
        }

        if (!startTime) {
            setError("未選擇起始時間");
            return;
        }

        if (!endTime) {
            setError("未選擇結束時間");
            return;
        }

        if (startTime >= endTime) {
            setError("起始時間不能比結束時間晚");
            return;
        }

        // check if user is logged in
        const user = UserService.getLocalStorageUser();
        if (user.id === 0) {
            setError("用戶未登入");
            return;
        }

        const driverData = {
            user_id: user.id,
            driver_name: name,
            driver_phone: phone,
            direction,
            available_date: date,
            start_time: startTime,
            end_time: endTime,
        };

        try {
            const response = await fetch(initialData ? `/api/drivers/${phone}` : '/api/drivers', {
                method: initialData ? 'PATCH' : 'POST',
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
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="輸入您的姓名" />
            </div>
            <div className="mb-4">
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="輸入您的電話" disabled={!!initialData} />
            </div>                                                      
            <div className="mb-4">
                <Label htmlFor="available_date" className="block text-sm font-medium text-gray-700">方便運送的日期</Label>
                <Input
                    type="date"
                    id="available_date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full"
                />
            </div>
            <div className="mb-4">
                <Label htmlFor="start_time" className="block text-sm font-medium text-gray-700">方便運送的起始時間</Label>
                <Select onValueChange={setStartTime} value={startTime}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="選擇起始時間" />
                    </SelectTrigger>
                    <SelectContent>
                        {["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="mb-4">
                <Label htmlFor="end_time" className="block text-sm font-medium text-gray-700">方便運送的結束時間</Label>
                <Select onValueChange={setEndTime} value={endTime}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="選擇結束時間" />
                    </SelectTrigger>
                    <SelectContent>
                        {["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button className="bg-black text-white w-full" onClick={handleSubmit}>{initialData ? "更新" : "提交"}</Button>
        </>
    );
};

export default DriverForm;

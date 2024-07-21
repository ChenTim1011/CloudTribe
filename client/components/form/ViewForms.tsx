"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormOrderCard from '@/components/form/FormOrderCard'; 
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import NavigationBar from "@/components/NavigationBar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ViewForms: React.FC = () => {
    const [role, setRole] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const [showSheet, setShowSheet] = useState(false);

    const handleFetchOrders = async () => {
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
    };

    const handleAccept = async (orderId: string) => {
        console.log(`Accepting order with ID: ${orderId}`);
    };

    const handleTransfer = async (orderId: string, newDriverPhone: string) => {
        console.log(`Transferring order with ID: ${orderId} to new driver with phone: ${newDriverPhone}`);
    };

    const handleNavigate = async (orderId: string, driverId: number) => {
        console.log(`Navigating to order with ID: ${orderId} for driver ID: ${driverId}`);
    };

    const handleComplete = async (orderId: string) => {
        console.log(`Completing order with ID: ${orderId}`);
    };

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
                            <div className="mt-4">
                                {orders.map(order => (
                                    <FormOrderCard
                                        key={order.id}
                                        order={order}
                                        role={role} 
                                        driverId={0}
                                        onAccept={handleAccept}
                                        onTransfer={handleTransfer}
                                        onNavigate={handleNavigate}
                                        onComplete={handleComplete}
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

"use client";

import React, { useState } from 'react';
import DriverForm from "@/components/driver/DriverForm";
import LoginForm from "@/components/driver/LoginForm";
import OrderListWithPagination from "@/components/driver/OrderListWithPagination";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";
import NavigationBar from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

const DriverPage: React.FC = () => {
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showDriverOrders, setShowDriverOrders] = useState(false);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [driverData, setDriverData] = useState<{ id: string } | null>(null);
    const [driverOrders, setDriverOrders] = useState([]); // State to store driver's orders

    const handleFetchOrders = async (phone: string) => {
        try {
            const response = await fetch(`/api/orders`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleFetchDriverOrders = async () => {
        if (!driverData || !driverData.id) {
            console.error("Driver data is missing or incomplete");
            return;
        }
        try {
            const response = await fetch(`/api/drivers/${driverData.id}/orders`);
            if (!response.ok) {
                throw new Error('Failed to fetch driver orders');
            }
            const data = await response.json();
            setDriverOrders(data);
        } catch (error) {
            console.error('Error fetching driver orders:', error);
        }
    };

    const handleAccept = (orderId: string) => {
        // Handle order acceptance logic
    };

    const handleTransfer = (orderId: string) => {
        // Handle order transfer logic
    };

    const handleNavigate = (orderId: string) => {
        // Handle order navigation logic
    };

    const handleFilteredOrders = (filtered: any[]) => {
        setFilteredOrders(filtered);
    };

    const handleUpdateSuccess = (data: any) => {
        setDriverData(data);
        setShowRegisterForm(false);
        setShowLoginForm(true);  // Open login form
    };

    return (
        <div>
            <NavigationBar />
            <div
                className="flex h-screen"
                style={{
                    backgroundImage: "url('/road.jpg')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 1,
                    height: '400px',
                }}
            >
                <div className="content flex-grow p-10 bg-white bg-opacity-10 flex flex-col items-center">
                    <div className="w-full flex justify-start space-x-2 mt-4">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            返回主頁
                        </Button>
                    </div>
                    <h1 className="mb-20 text-4xl font-bold text-white text-center" style={{ marginTop: '40px' }}>感謝您的服務</h1>
                    <div className="flex space-x-4">
                        <Button 
                            className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                            onClick={() => setShowRegisterForm(true)}
                        >
                            首次使用
                        </Button>
                        <Button 
                            className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                            onClick={() => setShowLoginForm(true)}
                        >
                            查看表單
                        </Button>
                        <Button 
                            className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                            onClick={() => {
                                setShowDriverOrders(true);
                                handleFetchDriverOrders(); // Fetch driver orders when opening the sheet
                            }}
                        >
                            管理訂單
                        </Button>
                    </div>

                    <Sheet open={showRegisterForm} onOpenChange={setShowRegisterForm}>
                        <SheetContent className="w-full max-w-2xl" aria-describedby="register-form-description">
                            <SheetHeader>
                                <SheetTitle>首次使用</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            <DriverForm onClose={() => setShowRegisterForm(false)} onUpdateSuccess={handleUpdateSuccess} />
                        </SheetContent>
                    </Sheet>

                    <Sheet open={showLoginForm} onOpenChange={setShowLoginForm}>
                        <SheetContent className="w-full max-w-2xl" aria-describedby="login-form-description">
                            <SheetHeader>
                                <SheetTitle>查看表單</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            <LoginForm
                                onClose={() => setShowLoginForm(false)}
                                onFetchOrders={handleFetchOrders}
                                onFetchDriverData={(data) => setDriverData(data)}
                                onFilteredOrders={handleFilteredOrders}
                            />
                        </SheetContent>
                    </Sheet>

                    <Sheet open={showDriverOrders} onOpenChange={setShowDriverOrders}> 
                        <SheetContent className="w-full max-w-2xl max-h-[calc(100vh-200px)] overflow-y-auto" aria-describedby="driver-orders-description">
                            <SheetHeader>
                                <SheetTitle>我的訂單</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            <DriverOrdersPage driverData={driverData} />
                        </SheetContent>
                    </Sheet>

                    <div className="w-full mt-10">
                        <OrderListWithPagination
                            orders={filteredOrders}
                            onAccept={handleAccept}
                            onTransfer={handleTransfer}
                            onNavigate={handleNavigate}
                            driverData={driverData}
                            onOrderAccepted={handleFetchDriverOrders} // Pass the fetch driver orders function
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverPage;

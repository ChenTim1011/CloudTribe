"use client";

import React, { useState, useEffect } from 'react';
import DriverForm from "@/components/driver/DriverForm";
import LoginForm from "@/components/driver/LoginForm";
import OrderListWithPagination from "@/components/driver/OrderListWithPagination";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";
import { NavigationBar } from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useRouter } from 'next/navigation';
import UserService from '@/services/user/user'; 

const DriverPage: React.FC = () => {
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showDriverOrders, setShowDriverOrders] = useState(false);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [driverData, setDriverData] = useState<{ id: number } | null>(null);
    const [driverOrders, setDriverOrders] = useState([]); // State to store driver's orders
    const [isDriver, setIsDriver] = useState(false);  // State to check if the user is a driver
    const router = useRouter();

    useEffect(() => {
        // check if the user is a driver
        const user = UserService.getLocalStorageUser();
        setIsDriver(user.is_driver);
        if (user.is_driver) {
            setDriverData({ id: user.id });
        }
    }, []);

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
        console.log("Fetching driver orders with driverData:", driverData);
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

    const handleAcceptOrder = async (orderId: string) => {
        try {
            console.log("handleAcceptOrder called with driverData:", driverData);
            console.log("Accepting order with orderId:", orderId);
            if (!driverData || !driverData.id) {
                console.error("Driver data is missing or incomplete");
                return;
            }
        
            const timestamp = new Date().toISOString();
        
            const response = await fetch(`/api/orders/${orderId}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    driver_id: driverData.id,
                    order_id: orderId,  
                    action: "接單",
                    timestamp: timestamp,
                    previous_driver_id: null,
                    previous_driver_name: null,
                    previous_driver_phone: null
                }),
            });
        
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to accept order: ${errorText}`);
            }
        
            setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
            alert('接單成功');
            handleFetchDriverOrders(); // Notify parent component that an order has been accepted
        } catch (error) {
            console.error('Error accepting order:', error);
            alert('接單失敗');
        }
    };

    const handleTransferOrder = async (orderId: string, newDriverPhone: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ current_driver_id: driverData?.id, new_driver_phone: newDriverPhone }),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to transfer order: ${errorText}`);
            }
    
            setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
            alert('轉單成功');
        } catch (error) {
            console.error('Error transferring order:', error);
            alert('轉單失敗');
        }
    };

    const handleNavigate = (orderId: string, driverId: number) => {
        console.log("Navigating to order with driverData:", driverData);
        router.push(`/navigation?orderId=${orderId}&driverId=${driverId}`);
    };

    const handleCompleteOrder = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to complete order');
            }

            setFilteredOrders(filteredOrders.filter(order => order.id !== orderId)); // 直接移除已完成的訂單
            alert('訂單已完成');
        } catch (error) {
            console.error('Error completing order:', error);
            alert('完成訂單失敗');
        }
    };

    const handleFilteredOrders = (filtered: any[]) => {
        setFilteredOrders(filtered);
    };

    const handleUpdateSuccess = (data: any): void => {
        console.log("Updating driverData with:", data);
        setDriverData(data);

        // update user data in local storage
        const user = UserService.getLocalStorageUser();
        const updatedUser = { ...user, is_driver: true };
        UserService.setLocalStorageUser(updatedUser);

        setIsDriver(true); // Set the user as a driver
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
                    height: '100vh', 
                }}
            >
                <div className="content flex-grow p-10 bg-white bg-opacity-10 flex flex-col items-center">
                <div className="w-full flex justify-start space-x-2 mt-4">
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        返回主頁
                    </Button>
                </div>
                <h1 className="mb-20 text-4xl font-bold text-white text-center" style={{ marginTop: '40px' }}>司機專區</h1>
                    <div className="flex flex-wrap space-x-4 justify-center">
                        {/* if the user is not the driver */}
                        {!isDriver && (
                            <Button 
                                className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                                onClick={() => setShowRegisterForm(true)}
                            >
                                申請司機
                            </Button>
                        )}

                        {/* if the user is the driver */}
                        {isDriver && (
                            <>
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
                            </>
                        )}
                    </div>

                    <Sheet open={showRegisterForm} onOpenChange={setShowRegisterForm}>
                        <SheetContent className="w-full max-w-2xl" aria-describedby="register-form-description">
                            <SheetHeader>
                                <SheetTitle>申請司機</SheetTitle>
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
                        {driverData?.id && (
                            <OrderListWithPagination
                                orders={filteredOrders}
                                onAccept={handleAcceptOrder}
                                onTransfer={handleTransferOrder}
                                onNavigate={handleNavigate}
                                onComplete={handleCompleteOrder}
                                driverId={driverData.id}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverPage;

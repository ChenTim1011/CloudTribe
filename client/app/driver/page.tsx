"use client";

import React, { useState, useEffect } from 'react';
import DriverForm from "@/components/driver/DriverForm";
import LoginForm from "@/components/driver/LoginForm";
import OrderListWithPagination from "@/components/driver/OrderListWithPagination";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";
import DriverAvailableTimes from "@/components/driver/DriverAvailableTimes"; 
import { NavigationBar } from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from 'next/navigation';
import UserService from '@/services/user/user'; 
import { Driver } from '@/interfaces/driver/Driver'; // 引入 Driver 接口

const DriverPage: React.FC = () => {
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showDriverOrders, setShowDriverOrders] = useState(false);
    const [showAddTimeSheet, setShowAddTimeSheet] = useState(false); 
    const [unacceptedOrders, setUnacceptedOrders] = useState<any[]>([]);
    const [acceptedOrders, setAcceptedOrders] = useState<any[]>([]);
    const [driverData, setDriverData] = useState<Driver | null>(null);
    const [date, setDate] = useState<Date | undefined>(new Date()); 
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [locations, setLocations] = useState<string>(""); 
    const router = useRouter();
    const [user, setUser] = useState(UserService.getLocalStorageUser());
    const [isClient, setIsClient] = useState(false); 

    // add state for showing unaccepted orders
    const [showUnacceptedOrders, setShowUnacceptedOrders] = useState(false);
    const [showAcceptedOrders, setShowAcceptedOrders] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const handleUserDataChanged = () => {
            const updatedUser = UserService.getLocalStorageUser();
            setUser(updatedUser);
        };
    
        window.addEventListener('userDataChanged', handleUserDataChanged);
    
        return () => {
            window.removeEventListener('userDataChanged', handleUserDataChanged);
        };
    }, []);

    // ensure user.is_driver is a boolean
    useEffect(() => {
        if (user && typeof user.is_driver === 'string') {
            user.is_driver = user.is_driver === 'true';
            setUser({ ...user });
        }
    }, [user]);

    // 根據 user.id 獲取 driverData
    useEffect(() => {
        if (isClient && user && user.is_driver) {
            fetchDriverData(user.id);
        }
    }, [isClient, user]);

    /**
     * Fetch driver data based on user_id.
     * @param userId - The user's ID.
     */
    const fetchDriverData = async (userId: number) => {
        try {
            const response = await fetch(`/api/drivers/user/${userId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("用戶尚未成為司機");
                } else {
                    throw new Error('Failed to fetch driver data');
                }
            } else {
                const data: Driver = await response.json();
                console.log('Fetched driver data:', data);
                setDriverData(data);
                // 獲取已接單訂單
                handleFetchDriverOrders(data.id);
            }
        } catch (error) {
            console.error('Error fetching driver data:', error);
        }
    };

    /**
     * Fetch unaccepted orders.
     */
    const handleFetchUnacceptedOrders = async () => {
        try {
            const response = await fetch(`/api/orders?status=未接單`);
            if (!response.ok) {
                throw new Error('Failed to fetch unaccepted orders');
            }
            const data = await response.json();
            console.log('Fetched unaccepted orders:', data); 
            setUnacceptedOrders(data);
        } catch (error) {
            console.error('Error fetching unaccepted orders:', error);
        }
    };

    /**
     * Fetch accepted orders assigned to the driver.
     * @param driverId - The driver's ID.
     */
    const handleFetchDriverOrders = async (driverId: number) => {
        try {
            const response = await fetch(`/api/drivers/${driverId}/orders`);
            if (!response.ok) {
                throw new Error('Failed to fetch driver orders');
            }
            const data = await response.json();
            console.log('Fetched driver orders:', data);
            setAcceptedOrders(data);
        } catch (error) {
            console.error('Error fetching driver orders:', error);
        }
    };

    /**
     * Handle accepting an order.
     * @param orderId - The ID of the order to accept.
     */
    const handleAcceptOrder = async (orderId: string) => {
        try {
            console.log("handleAcceptOrder called with driverId:", driverData?.id);
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
        
            alert('接單成功');
            if (driverData) {
                handleFetchDriverOrders(driverData.id); 
            }
            handleFetchUnacceptedOrders(); 
        } catch (error) {
            console.error('Error accepting order:', error);
            alert('接單失敗');
        }
    };

    /**
     * Handle transferring an order.
     * @param orderId - The ID of the order to transfer.
     * @param newDriverPhone - The phone number of the new driver.
     */
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
    
            alert('轉單成功');
            if (driverData) {
                handleFetchDriverOrders(driverData.id); 
            }
            handleFetchUnacceptedOrders(); 
        } catch (error) {


            console.error('Error transferring order:', error);
            alert('轉單失敗');
        }
    };

    /**
     * Handle navigating to order details.
     * @param orderId - The ID of the order to navigate to.
     * @param driverId - The driver's ID.
     */
    const handleNavigate = (orderId: string, driverId: number) => {
        console.log("Navigating to order with driverId:", driverId);
        router.push(`/navigation?orderId=${orderId}&driverId=${driverId}`);
    };

    /**
     * Handle completing an order.
     * @param orderId - The ID of the order to complete.
     */
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

            alert('訂單已完成');
            handleFetchDriverOrders(driverData!.id); // 更新已接單訂單
        } catch (error) {
            console.error('Error completing order:', error);
            alert('完成訂單失敗');
        }
    };

    /**
     * Handle applying to become a driver.
     */
    const handleApplyDriverClick = () => {
        if (!user || user.id === 0 || user.name === 'empty' || user.phone === 'empty') {
            alert('請先按右上角的登入');
        } else {
            setShowRegisterForm(true);
        }
    };

    /**
     * Handle successful driver data update.
     * @param data - Updated driver data.
     */
    const handleUpdateSuccess = (data: Driver): void => {
        console.log("Updating driverData with:", data);
        setDriverData(data);

        // Update user to driver
        const updatedUser = { ...user, is_driver: true };
        UserService.setLocalStorageUser(updatedUser);
        setUser(updatedUser);
        setShowRegisterForm(false);
    };

    /**
     * Handle adding a new time slot.
     */
    const handleAddTimeSlot = async () => {
        if (date && startTime && endTime && locations) {
            try {
                const response = await fetch(`/api/drivers/time`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        driver_id: driverData?.id, // 使用 driverData.id
                        date: date.toISOString().split('T')[0], 
                        start_time: startTime,
                        end_time: endTime,
                        locations,
                    }),
                });
                const result = await response.json();
                console.log("Time slot added:", result);
                setShowAddTimeSheet(false); // 關閉 Sheet
            } catch (error) {
                console.error("Error adding time slot:", error);
            }
        }
    };

    /**
     * Toggle the visibility of Unaccepted Orders List
     */
    const toggleUnacceptedOrders = () => {
        setShowUnacceptedOrders(prev => {
            const newState = !prev;
            if (newState && unacceptedOrders.length === 0) {
                handleFetchUnacceptedOrders();
            }
            return newState;
        });
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
                    width: '100vw',
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
                        {/* 使用者不是司機 */}
                        {(isClient && !user?.is_driver)  && (
                            <Button 
                                className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                                onClick={handleApplyDriverClick}
                            >
                                申請司機
                            </Button>
                        )}

                        {/* 使用者是司機 */}
                        {isClient && user?.is_driver && (
                            <>
                                <DriverAvailableTimes driverId={driverData?.id || 0} />


                                {/* 「取得未接單表單」按鈕 */}
                                <Button 
                                    className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                                    onClick={toggleUnacceptedOrders}
                                >
                                    {showUnacceptedOrders ? '隱藏未接單表單' : '取得未接單表單'}
                                </Button>



                                <Button 
                                    className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                                    onClick={() => {
                                        setShowDriverOrders(true);
                                        if (driverData?.id) {
                                            handleFetchDriverOrders(driverData.id);
                                        }
                                    }}
                                >
                                    管理訂單
                                </Button>
       
                            </>
                        )}
                    </div>

                    {/* 申請司機表單 */}
                    <Sheet open={showRegisterForm} onOpenChange={setShowRegisterForm}>
                        <SheetContent className="w-full max-w-2xl" aria-describedby="register-form-description">
                            <SheetHeader>
                                <SheetTitle>申請司機</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            <DriverForm onClose={() => setShowRegisterForm(false)} onUpdateSuccess={handleUpdateSuccess} />
                        </SheetContent>
                    </Sheet>

                    {/* 查看表單 */}
                    <Sheet open={showLoginForm} onOpenChange={setShowLoginForm}>
                        <SheetContent className="w-full max-w-2xl" aria-describedby="login-form-description">
                            <SheetHeader>
                                <SheetTitle>查看表單</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            <LoginForm
                                onClose={() => setShowLoginForm(false)}
                                onFetchOrders={handleFetchUnacceptedOrders}
                                onFetchDriverData={(data: Driver) => setDriverData(data)}
                                onFilteredOrders={(accepted: any[]) => setAcceptedOrders(accepted)}
                            />
                        </SheetContent>
                    </Sheet>

                    {/* 管理訂單頁面 */}
                    <Sheet open={showDriverOrders} onOpenChange={setShowDriverOrders}> 
                        <SheetContent className="w-full max-w-2xl max-h-[calc(100vh-200px)] overflow-y-auto" aria-describedby="driver-orders-description">
                            <SheetHeader>
                                <SheetTitle>我的訂單</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            {driverData && <DriverOrdersPage driverData={driverData} />}
                        </SheetContent>
                    </Sheet>

                    {/* 訂單列表 */}
                    <div className="w-full mt-10">
                        {/* 未接單訂單列表 */}
                        {showUnacceptedOrders && (
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold mb-4">未接單訂單</h2>
                                <OrderListWithPagination
                                    orders={unacceptedOrders}
                                    onAccept={handleAcceptOrder}
                                    onTransfer={handleTransferOrder}
                                    onNavigate={handleNavigate}
                                    onComplete={handleCompleteOrder}
                                    driverId={driverData?.id || 0} // 使用 driverData.id 作為 driverId
                                />
                            </div>
                        )}

                        {/* 已接單訂單列表 */}
                        {showAcceptedOrders && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">已接單訂單</h2>
                                <OrderListWithPagination
                                    orders={acceptedOrders}
                                    onAccept={handleAcceptOrder}
                                    onTransfer={handleTransferOrder}
                                    onNavigate={handleNavigate}
                                    onComplete={handleCompleteOrder}
                                    driverId={driverData?.id || 0} // 使用 driverData.id 作為 driverId
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

};

export default DriverPage;

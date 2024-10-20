"use client";

import React, { useState, useEffect } from 'react';
import DriverForm from "@/components/driver/DriverForm";
import LoginForm from "@/components/driver/LoginForm";
import OrderListWithPagination from "@/components/driver/OrderListWithPagination";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";
import { NavigationBar } from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from 'next/navigation';
import UserService from '@/services/user/user'; 

const DriverPage: React.FC = () => {
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showDriverOrders, setShowDriverOrders] = useState(false);
    const [showAddTimeSheet, setShowAddTimeSheet] = useState(false); // 新增的 state，用來控制新增時間的 Sheet
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [driverData, setDriverData] = useState<{ id: number } | null>(null);
    const [driverOrders, setDriverOrders] = useState([]); // State to store driver's orders
    const [date, setDate] = useState<Date | undefined>(new Date()); // 日期狀態
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [locations, setLocations] = useState<string>(""); // 地點狀態
    const router = useRouter();
    const [user, setUser] = useState(UserService.getLocalStorageUser());
    const [isClient, setIsClient] = useState(false); 

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


    // 如果需要，確保 user.is_driver 是布林值
    if (user && typeof user.is_driver === 'string') {
        user.is_driver = user.is_driver === 'true';
    }

    const handleFetchOrders = async (phone: string) => {
        try {
            const response = await fetch(`/api/orders`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            console.log('Fetched orders:', data); 
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleApplyDriverClick = () => {
        if (!user || user.id === 0 || user.name === 'empty' || user.phone === 'empty') {
          alert('請先按右上角的登入');
        } else {
          setShowRegisterForm(true);
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

    const handleApplyDriver = async () => {
        const user = UserService.getLocalStorageUser();
        if (!user.id) {
            alert("用戶未登入");
            return;
        }

        try {
            const response = await fetch(`/api/users/driver/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const updatedUser = { ...user, is_driver: true };
                UserService.setLocalStorageUser(updatedUser);
            } else {
                alert('申請司機失敗');
            }
        } catch (error) {
            console.error('Error updating user to driver:', error);
        }
    };

    const handleUpdateSuccess = (data: any): void => {
        console.log("Updating driverData with:", data);
        setDriverData(data);

        // update user data in local storage
        const updatedUser = { ...user, is_driver: true };
        UserService.setLocalStorageUser(updatedUser);
        setUser(updatedUser);
        setShowRegisterForm(false);
        setShowLoginForm(true);  // Open login form
    };

    // 新增時間的提交邏輯
    const handleAddTimeSlot = async () => {
        if (date && startTime && endTime && locations) {
            try {
                const response = await fetch(`/api/driver/time`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        driver_id: driverData?.id,
                        date: date.toISOString().split('T')[0], // 日期格式 YYYY-MM-DD
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
                        {(isClient && !user.is_driver)  && (
                            <Button 
                                className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                                onClick={handleApplyDriverClick}
                            >
                                申請司機
                            </Button>
                        )}

                        {/* if the user is the driver */}
                        {isClient && user.is_driver && (
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

                                {/* 新增時間的按鈕 */}
                                <Button 
                                    className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                                    onClick={() => setShowAddTimeSheet(true)}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="h-6 w-6" />
                                    新增時間
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

                    <Sheet open={showAddTimeSheet} onOpenChange={setShowAddTimeSheet}> 
                        <SheetContent className="w-full max-w-2xl" aria-describedby="add-time-description">
                            <SheetHeader>
                                <SheetTitle>新增可用時間</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            <div className="mt-4">
                                {/* 日期選擇 */}
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border mt-2"
                                />

                                {/* 時間選擇 */}
                                <div className="flex space-x-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium">開始時間</label>
                                        <select
                                            title="開始時間"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        >
                                            <option value="">選擇開始時間</option>
                                            {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((time) => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">結束時間</label>
                                        <select
                                            title="結束時間"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        >
                                            <option value="">選擇結束時間</option>
                                            {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((time) => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 地點輸入 */}
                                <Input
                                    type="text"
                                    value={locations}
                                    onChange={(e) => setLocations(e.target.value)}
                                    placeholder="輸入地點"
                                    className="mt-4"
                                />

                                {/* 新增按鈕 */}
                                <Button className="mt-4 bg-blue-500 text-white" onClick={handleAddTimeSlot}>
                                    新增時間
                                </Button>
                            </div>
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

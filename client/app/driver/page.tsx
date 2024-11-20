"use client";

import React, { useState, useEffect } from 'react';
import DriverForm from "@/components/driver/DriverForm";
import OrderListWithPagination from "@/components/driver/OrderListWithPagination";
import DriverOrdersPage from "@/components/driver/DriverOrdersPage";
import DriverAvailableTimes from "@/components/driver/DriverAvailableTimes"; 
import { NavigationBar } from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';
import UserService from '@/services/user/user'; 
import DriverService  from '@/services/driver/driver';
import { Driver } from '@/interfaces/driver/driver'; 
import { Order } from '@/interfaces/tribe_resident/buyer/order';
import { DriverOrder } from '@/interfaces/driver/driver';


const DriverPage: React.FC = () => {
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [showDriverOrders, setShowDriverOrders] = useState(false);
    const [unacceptedOrders, setUnacceptedOrders] = useState<Order[]>([]);
    const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
    const [driverData, setDriverData] = useState<Driver | null>(null);
    const router = useRouter();
    const [user, setUser] = useState(UserService.getLocalStorageUser());
    const [isClient, setIsClient] = useState(false); 
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
    const [showAddTimeTip, setShowAddTimeTip] = useState(true);

    // add state for showing unaccepted orders
    const [showUnacceptedOrders, setShowUnacceptedOrders] = useState(false);

        /**
     * Fetch driver data based on user_id.
     * @param userId - The user's ID.
     */
        const fetchDriverData = async (userId: number) => {
            try {
                const response = await fetch(`/api/drivers/user/${userId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("使用者尚未成為司機");
                    } else {
                        throw new Error(`Failed to fetch driver data: ${response.statusText}`);
                    }
                } else {
                    const data: Driver = await response.json();
                    console.log('Fetched driver data:', data);
                    setDriverData(data);
                    handleFetchDriverOrders(data.id);
                }
            } catch (error) {
                console.error('Error fetching driver data:', error);
            }
        };

    useEffect(() => {
        setShowAddTimeTip(true);
        setIsClient(true);
        const handleUserDataChanged = () => {
            const updatedUser = UserService.getLocalStorageUser();
            setUser(updatedUser);
        };
    
        window.addEventListener("userDataChanged", handleUserDataChanged);
    
        return () => {
            window.removeEventListener("userDataChanged", handleUserDataChanged);
        };
    }, []);

    // ensure user.is_driver is a boolean
    useEffect(() => {
        if (user && typeof user.is_driver === 'string') {
            user.is_driver = user.is_driver === 'true';
            setUser({ ...user });
        }
    }, [user]);

    // use user.id to get driverData
    useEffect(() => {
        if (isClient && user && user.is_driver) {
            fetchDriverData(user.id);
        }
    }, [isClient, user,fetchDriverData]);



    /**
     * Fetch unaccepted orders.
     */
    const handleFetchUnacceptedOrders = async () => {
        try {
            const response = await fetch(`/api/orders`);
            if (!response.ok) {
                throw new Error('Failed to fetch unaccepted orders');
            }
            
            let data: Order[] = await response.json();
        
            // define current time to filter future unaccepted orders
            const now = new Date();

            // condition: only show future unaccepted orders
            /*
            data = data.filter((order) => {
                const orderDateTime = new Date(`${order.date}T${order.time}`);
                const isFuturePendingOrder = orderDateTime > now && order.order_status === "未接單";
                
                const matchesStartDate = filterStartDate ? new Date(order.date) >= filterStartDate : true;
                const matchesEndDate = filterEndDate ? new Date(order.date) <= filterEndDate : true;
        
                return isFuturePendingOrder && matchesStartDate && matchesEndDate;
            });*/
            // no filter date version
            data = data.filter((order) => 
                order.order_status === "未接單")
                .sort((a, b) => (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0));
                
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



    //New Version to handle accepting an order
    
    const handleAcceptOrder = async (orderId: string, service: string) => {
        console.log("handleAcceptOrder called with driverId:", driverData?.id);
        console.log("Accepting order with orderId:", orderId);
        if (!driverData || !driverData.id) {
            console.error("Driver data is missing or incomplete");
            return;
        }
        try {
            const timestamp = new Date().toISOString();
            const acceptOrder: DriverOrder = {
                driver_id: driverData.id,
                order_id: parseInt(orderId),  
                action: "接單",
                timestamp: timestamp,
                previous_driver_id: undefined,
                previous_driver_name: undefined,
                previous_driver_phone: undefined,
                service: service
            }
            await DriverService.handle_accept_order(service, parseInt(orderId), acceptOrder)
            alert('接單成功');

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
    
            alert('轉單成功，重整頁面可看到更新結果');

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
    const handleCompleteOrder = async (orderId: string, service: string) => {
        try {
            console.log('service=', service)
            const response = await fetch(`/api/orders/${service}/${orderId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to complete order');
            }

            alert('訂單已完成');

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
                    backgroundImage: 'url("/road.jpg")',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 1,
                    width: '100vw',
                    height: '100vh', 
                }}
            >
                <div className="content flex-grow p-10 bg-white bg-opacity-10 flex flex-col items-center">
                    
                    {/* To remind */}
                    {showAddTimeTip && (
                        <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">提醒：</strong>
                            <span className="block sm:inline">請到 "新增時間" 以設定您的可運送時間，讓賣家知道您何時可以接單。</span>
                            <Button
                                className="absolute top-0 bottom-0 right-0 px-4 py-3" 
                                onClick={() => setShowAddTimeTip(false)}
                            >
                                <span aria-hidden="true">&times;</span>
                            </Button>
                        </div>
                    )}
                    
                    <div className="w-full flex justify-start space-x-2 mt-4">
                    </div>
                    <h1 className="mb-20 text-4xl font-bold text-white text-center" style={{ marginTop: '40px' }}>司機專區</h1>
                    <div className="flex flex-wrap space-x-4 justify-center">
                        {/* If user is not a driver */}
                        {(isClient && !user?.is_driver)  && (
                            <Button 
                                className="mb-10 px-6 py-3 text-lg font-bold border-2 border-black text-black bg-white hover:bg-blue-500 hover:text-white"
                                onClick={handleApplyDriverClick}
                            >
                                申請司機
                            </Button>
                        )}

                        {isClient && user?.is_driver && (
                            <>
                                <DriverAvailableTimes driverId={driverData?.id || 0} />


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

                    {isClient && user?.is_driver && showUnacceptedOrders && (
                    <div className="flex flex-col items-center mb-4">
                        <div className="flex space-x-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">起始日期</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-bold  border-black hover:bg-blue-500 hover:text-white">
                                            {filterStartDate ? format(filterStartDate, "PPP") : "選擇開始日期"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filterStartDate || undefined}
                                            onSelect={(day) => setFilterStartDate(day || null)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-bold  border-black hover:bg-blue-500 hover:text-white">
                                            {filterEndDate ? format(filterEndDate, "PPP") : "選擇結束日期"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filterEndDate || undefined}
                                            onSelect={(day) => setFilterEndDate(day || null)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button
                                className="mt-6 px-4 py-2 bg-white text-black font-bold  border-black hover:bg-blue-500 hover:text-white "
                                onClick={handleFetchUnacceptedOrders}
                            >
                                篩選訂單
                            </Button>
                        </div>
                    </div>
                )}
                    {/* Apply for driver */}
                    <Sheet open={showRegisterForm} onOpenChange={setShowRegisterForm}>
                        <SheetContent className="w-full max-w-2xl" aria-describedby="register-form-description">
                            <SheetHeader>
                                <SheetTitle>申請司機</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            <DriverForm onClose={() => setShowRegisterForm(false)} onUpdateSuccess={handleUpdateSuccess} />
                        </SheetContent>
                    </Sheet>

                    {/* Order management page */}
                    <Sheet open={showDriverOrders} onOpenChange={setShowDriverOrders}> 
                        <SheetContent className="w-full max-w-2xl max-h-[calc(100vh-200px)] overflow-y-auto" aria-describedby="driver-orders-description">
                            <SheetHeader>
                                <SheetTitle>我的訂單</SheetTitle>
                                <SheetClose />
                            </SheetHeader>
                            {driverData && <DriverOrdersPage 
                                            driverData={driverData} 
                                            onAccept={handleAcceptOrder}
                                            onTransfer={handleTransferOrder}
                                            onNavigate={(orderId: string) => handleNavigate(orderId, driverData?.id || 0)}
                                            onComplete={handleCompleteOrder}
                                            
                                            />}
                        </SheetContent>
                    </Sheet>

                    {/* OrderList */}
                    <div className="w-full mt-10">
                        {/* UnacceptedOrdersList */}
                        {showUnacceptedOrders && (
                            <div className="mb-10">
                                <h2 className="text-center text-2xl font-bold mb-4 text-white">未接單訂單</h2>
                                <OrderListWithPagination
                                    orders={unacceptedOrders}
                                    onAccept={handleAcceptOrder}
                                    onTransfer={handleTransferOrder}
                                    onNavigate={(orderId: string) => handleNavigate(orderId, driverData?.id || 0)}
                                    onComplete={handleCompleteOrder}
                                    driverId={driverData?.id || 0}
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

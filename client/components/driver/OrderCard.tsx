"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order } from '@/interfaces/tribe_resident/buyer/order';
import DriverService from '@/services/driver/driver'
import { TimeSlot } from '@/interfaces/driver/driver'


/**
 * Represents an order card component.
 * @param {Object} props - The props passed to the component.
 * @param {Order} props.order - The order object containing details of the order.
 * @param {number} props.driverId - The ID of the driver handling the order.
 * @param {Function} props.onAccept - Callback function to accept the order.
 * @param {Function} props.onTransfer - Callback function to transfer the order to a new driver.
 * @param {Function} props.onNavigate - Callback function to navigate to the order's location.
 * @param {Function} props.onComplete - Callback function to mark the order as completed.
 */
const OrderCard: React.FC<{
    order: Order;
    driverId: number;
    onAccept: (orderId: string, service: string) => Promise<void>;
    onTransfer: (orderId: string, newDriverPhone: string) => Promise<void>;
    onComplete: (orderId: string, service: string) => Promise<void>;
}> = ({ order, driverId, onAccept, onTransfer, onComplete }) => {
    console.log('OrderCard received order:', order);

    // State for managing the visibility of the transfer form
    const [showTransferForm, setShowTransferForm] = useState(false);
    // State for the new driver's phone number input
    const [newDriverPhone, setNewDriverPhone] = useState("");
    // State for error messages related to transfer operations
    const [transferError, setTransferError] = useState("");
    // State for error messages related to accepting the order
    const [acceptError, setAcceptError] = useState("");
    //state for drop agricultural product(if product is not put in the place that driver takes items)
    const [dropOrderMessage, setDropOrderMessage] = useState("");

    /**
     * Handles the acceptance of an order.
     */
    const handleAccept = async () => {
        try {
            if (order.id) {
                await onAccept(order.id.toString(), order.service);
                setAcceptError(""); // Clear any previous errors
            } else {
                setAcceptError("order ID not exist");
            }
        } catch (error: any) {
            // Handle errors and set an appropriate error message
            if (error.response && error.response.data.detail) {
                setAcceptError(error.response.data.detail);
            } else {
                setAcceptError("接單失敗，訂單已被接走");
            }
        }
    };

    /**
     * Handles the transfer of an order to a new driver.
     */
    const handleTransfer = async () => {
        // Validate the new driver's phone number
        if (/^\d{7,10}$/.test(newDriverPhone)) {
            try {
                await onTransfer(order.id?.toString() || "", newDriverPhone);
                setTransferError(""); // Clear error on success
                setShowTransferForm(false); // Hide the transfer form
            } catch (err: Error | any) {
                setTransferError(err.message);
            }
        } else {
            setTransferError("電話號碼必須是7到10位的數字");
        }
    };


    const handleDropOrder = async() => {
        let today = new Date().toLocaleDateString('zh-TW', {
            timeZone: 'Asia/Taipei',
        });
        today = today.replace(/\//g,'-')
        //const today = new Date().toISOString().split('T')[0] // 非台灣時間
        console.log(today)
        try{
            const res_driver_times: TimeSlot[] = await DriverService.get_specific_driver_times(driverId)
            console.log(res_driver_times)
            if(res_driver_times.length == 0){
                setDropOrderMessage('請先填寫可運送時間才可棄單')
            }
            else if(res_driver_times.some(slot => slot.date === today) != true){
                setDropOrderMessage('今天非運送日期無法棄單')
            }
            else if(order.is_put == true) {
                setDropOrderMessage('商品已送達運送地無法棄單')
            }
            else {
                try {
                    if(order.id != undefined) 
                        var res_delete = await DriverService.drop_agricultural_order(driverId, order.id)
                        console.log(res_delete)
                }
                catch(e){
                    console.log(e)
                }
                setDropOrderMessage('棄單成功!')
            }       
        }
        catch(e){
            console.log(e)
        }

    }

    const getImageSrc = (item: any) => {
        if (item.category === "小木屋鬆餅" || item.category === "金鰭" || item.category === "原丼力") {
            return `/test/${encodeURIComponent(item.img)}`; // Local image
        } else if (item.img?.includes('imgur.com')) {
            return item.img; // Imgur image - direct URL
        } else {
            return `https://www.cloudtribe.online${item.img}`; // CloudTribe image
        }
    };



    return (
        <Card 
            className={`max-w-md mx-auto my-6 shadow-lg ${
                order.is_urgent ? 'border-2 border-black-500' : ''
            }`}
        >
            {/* Card header displaying order type and buyer's name */}
            <CardHeader className="bg-black text-white p-4 rounded-t-md flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {order.is_urgent && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 ">
                            緊急
                        </span>
                    )}
                    <div>
                        <CardTitle className="text-lg font-bold">{order.order_type}</CardTitle>
                        <CardDescription className="text-lg text-white font-semibold">消費者姓名: {order.buyer_name}</CardDescription>
                    </div>
                </div>
                {order.order_status === '接單' && (
                    <div>
                        <Button className="bg-white text-black" onClick={() => onComplete(order.id?.toString() || "", order.service)}>
                            各別訂單貨物已到達目的地
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-4">
                {/* Order details including buyer phone, date, time, and location */}
                <div className="mb-2">
                    {order.order_status !== '未接單' && (
                        <p className="text-sm text-gray-700 font-bold">聯絡電話: {order.buyer_phone}</p>
                    )}
                    <p className="text-sm text-gray-700 font-bold">下單時間: {order.timestamp?.split('.')[0].replace('T', ' ')}</p>
                    <p className="text-sm text-gray-700 font-bold">送達地點: {order.location}</p>
                    
                </div>
                {/* List of items in the order */}
                <div className="mb-2">
                    <p className="text-sm text-gray-700 font-bold">商品:</p>
                    <ul className="list-disc list-inside ml-4">
                        {order.items.map((item) => (
                            <li key={item.item_id} className="text-sm text-gray-700 mb-2">
                                <div className="flex items-center space-x-2">
                                <img
                                    src={getImageSrc(item)}
                                    alt={item.item_name || '未命名'} 
                                    width={40} 
                                    height={40} 
                                    className="object-cover rounded"
                                />
                                    <div>
                                        {/* Display item name, location, price, and quantity */}
                                        <span className="block font-semibold text-black truncate" style={{ maxWidth: '20rem' }}>
                                            {item.item_name || '未命名'}
                                        </span>
                                        <span className="block font-semibold text-black truncate" style={{ maxWidth: '20rem' }}>
                                            地點: {item.location || '未命名'}
                                        </span>
                                        <span className="block">- {item.price} 元 x {item.quantity} = {item.quantity * item.price} 元</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Additional notes for the order, if any */}
                {order.note && (
                    <p className="text-sm text-gray-700 font-bold">備註: {order.note}</p>
                )}
                {/* Display previous driver info if the order was transferred */}
                {/* {order.previous_driver_name && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-700 font-bold">🔄轉單自: {order.previous_driver_name} ({order.previous_driver_phone})</p>
                    </div>
                )} */}
                {/* Transfer form for entering new driver's phone number */}
                {showTransferForm && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-700 font-bold">請輸入新司機的電話號碼:</p>
                        <Input
                            type="text"
                            value={newDriverPhone}
                            onChange={(e) => setNewDriverPhone(e.target.value)}
                            placeholder="7到10位數字"
                        />
                        <Button className="mt-2 bg-red-500 text-white" onClick={handleTransfer}>確認轉單</Button>
                        {transferError && (
                            <p className="text-red-600 mt-2">{transferError}</p>
                        )}
                    </div>
                )}
                {acceptError && (
                    <p className="text-red-600 mt-2">{acceptError}</p>
                )}
                {dropOrderMessage && (
                    <p className="text-red-600 mt-2">{dropOrderMessage}</p>
                )}
            </CardContent>
            {/* Card footer showing order status and total price */}
            <CardFooter className="bg-gray-100 p-4 rounded-b-md flex justify-between items-center">
                <div className="flex flex-col items-start">
                    <p className="text-sm text-gray-700 font-bold">訂單狀態: {order.order_status}</p>
                    <p className="text-sm text-gray-700 font-bold">總價格: {order.total_price} 元</p>
                </div>
                {/* Action buttons for accepting, transferring, or navigating to the order */}
                {order.order_status !== '已完成' && (
                    <div className="flex space-x-2">
                        {order.order_status === '未接單' ? (
                            <Button className="bg-black text-white" onClick={handleAccept}>接單</Button>
                        ) : (
                            <>
                                <Button className="bg-red-500 text-white" onClick={() => setShowTransferForm(true)}>轉單</Button>
                                {order.service == 'agricultural_product' &&
                                    <Button className="bg-black text-white" onClick={handleDropOrder}>棄單</Button>}
                            </>
                            
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default OrderCard;

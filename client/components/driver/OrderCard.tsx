import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order } from '@/interfaces/order/Order';

/**
 * Represents an order card component.
 */
const OrderCard: React.FC<{
  order: any; // The order object
  driverId: number; // The driver ID
  onAccept: (orderId: string) => Promise<void>; // Callback function for accepting an order
  onTransfer: (orderId: string, newDriverPhone: string) => Promise<void>; // Callback function for transferring an order to a new driver
  onNavigate: (orderId: string, driverId: number) => void; // Callback function for navigating to an order
  onComplete: (orderId: string) => Promise<void>; // Callback function for completing an order
}> = ({ order, driverId, onAccept, onTransfer, onNavigate, onComplete }) => {
  console.log('OrderCard received order:', order);
  const [showTransferForm, setShowTransferForm] = useState(false); // State for showing the transfer form
  const [newDriverPhone, setNewDriverPhone] = useState(""); // State for the new driver's phone number
  const [transferError, setTransferError] = useState(""); // State for transfer error message
  const [acceptError, setAcceptError] = useState(""); // State for accept error message

  /**
   * Handles the acceptance of an order.
   */
  const handleAccept = async () => {
    try {
      await onAccept(order.id);
      setAcceptError(""); // Clear any previous errors
      
    } catch (error: any) {
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
  const handleTransfer = () => {
    if (/^\d{7,10}$/.test(newDriverPhone)) {
      Promise.resolve(onTransfer(order.id, newDriverPhone))
        .then(() => setTransferError(""))
        .catch((err: Error) => setTransferError(err.message));
    } else {
      setTransferError("電話號碼必須是7到10位的數字");
    }
  };

  /**
   * Handles the navigation to an order.
   */
  const handleNavigate = () => {
    onNavigate(order.id, driverId);
  };


  return (
    <Card className="max-w-md mx-auto my-6 shadow-lg">
      <CardHeader className="bg-black text-white p-4 rounded-t-md flex justify-between">
        <div>
          <CardTitle className="text-lg font-bold">{order.order_type}</CardTitle>
          <CardDescription className="text-lg text-white font-semibold">消費者姓名: {order.buyer_name}</CardDescription>
        </div>
        {order.order_status === '接單' &&  (
          <Button className="bg-white text-black" onClick={() => onComplete(order.id)}>貨品已到達目的地</Button>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-sm text-gray-700 font-bold">電話: {order.buyer_phone}</p>
          <p className="text-sm text-gray-700 font-bold">最晚可接單日期: {order.date}</p>
          <p className="text-sm text-gray-700 font-bold">最晚可接單時間: {order.time}</p>
          <p className="text-sm text-gray-700 font-bold">地點: {order.location}</p>
        </div>
        <div className="mb-2">
          <p className="text-sm text-gray-700 font-bold">商品:  </p>
          <ul className="list-disc list-inside ml-4">
            {order.items.map((item: any) => (
              <li key={item.item_id} className="text-sm text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={`https://www.cloudtribe.online${item.img}`} 
                    alt={item.item_name || '未命名'} 
                    width={40} 
                    height={40} 
                    className="object-cover rounded"
                  />
                  <div>
                    <span className="block font-semibold text-black truncate" style={{ maxWidth: '20rem' }}>
                      {item.item_name || '未命名'}
                    </span>
                    <span className="block">- {item.quantity} x ${item.price.toFixed(2)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {order.note && (
          <p className="text-sm text-gray-700 font-bold">備註: {order.note}</p>
        )}
        {order.previous_driver_name && (
          <div className="mt-4">
            <p className="text-sm text-black-600 font-bold">🔄轉單自: {order.previous_driver_name} ({order.previous_driver_phone})</p>
          </div>
        )}
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
      </CardContent>
      <CardFooter className="bg-gray-100 p-4 rounded-b-md flex justify-between items-center">
        <div className="flex flex-col items-start">
          <p className="text-sm text-gray-700 font-bold">訂單狀態: {order.order_status}</p>
          <p className="text-sm text-gray-700 font-bold">總價格: ${order.total_price.toFixed(2)}</p>
        </div>
        {order.order_status !== '已完成' && (
          <div className="flex space-x-2">
            {order.order_status === '未接單' ? (
              <Button className="bg-black text-white" onClick={handleAccept}>接單</Button>
            ) : (
              <>
                <Button className="bg-red-500 text-white" onClick={() => setShowTransferForm(true)}>轉單</Button>
                <Button className="bg-black text-white" onClick={handleNavigate}>導航</Button>
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrderCard;

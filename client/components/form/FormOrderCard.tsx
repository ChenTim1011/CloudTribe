import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

const OrderCard: React.FC<{ order: any; onAccept: (orderId: string) => void; onTransfer: (orderId: string, newDriverPhone: string) => void; onNavigate: (orderId: string) => void }> = ({ order, onAccept, onTransfer, onNavigate }) => {
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [newDriverPhone, setNewDriverPhone] = useState("");
    const [transferError, setTransferError] = useState("");
    const router = useRouter();

    const handleTransfer = () => {
        if (/^\d{7,10}$/.test(newDriverPhone)) {
            Promise.resolve(onTransfer(order.id, newDriverPhone))
                .then(() => setTransferError(""))
                .catch((err: Error) => setTransferError(err.message));
        } else {
            setTransferError("電話號碼必須是7到10位的數字");
        }
    };

    const handleNavigate = () => {
        router.push(`/navigation?orderId=${order.id}`);
    };

    return (
        <Card className="max-w-md mx-auto my-6 shadow-lg">
            <CardHeader className="bg-black text-white p-4 rounded-t-md">
                <CardTitle className="text-lg font-bold">{order.order_type}</CardTitle>
                <CardDescription className="text-lg text-white font-semibold">消費者姓名: {order.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                <div className="mb-2">
                    <p className="text-sm text-gray-700 font-bold">電話: {order.phone}</p>
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
                                    <img src={item.img} alt={item.name} className="w-10 h-10 object-cover rounded" />
                                    <div>
                                        <span className="block font-semibold text-black truncate" style={{ maxWidth: '20rem' }}>
                                            {item.name || '未命名'}
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
            </CardContent>
            <CardFooter className="bg-gray-100 p-4 rounded-b-md flex justify-between items-center">
                <div className="flex flex-col items-start">
                    <p className="text-sm text-gray-700 font-bold">訂單狀態: {order.order_status}</p>
                    <p className="text-sm text-gray-700 font-bold">總價格: ${order.total_price.toFixed(2)}</p>
                </div>
            </CardFooter>
        </Card>
    );
};

export default OrderCard;
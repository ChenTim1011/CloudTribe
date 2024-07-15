import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const OrderCard: React.FC<{ order: any }> = ({ order }) => {
    return (
        <Card className="max-w-md mx-auto my-6 shadow-lg">
            <CardHeader className="bg-black text-white p-4 rounded-t-md">
                <CardTitle className="text-lg font-bold">{order.order_type}</CardTitle>
                <CardDescription className="text-sm">{order.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                <div className="mb-2">
                    <p className="text-sm text-gray-700 font-bold">電話: {order.phone}</p>
                    <p className="text-sm text-gray-700 font-bold">日期: {order.date}</p>
                    <p className="text-sm text-gray-700 font-bold">時間: {order.time}</p>
                    <p className="text-sm text-gray-700 font-bold">地點: {order.location}</p>
                </div>
                <div className="mb-2">
                    <p className="text-sm text-gray-700 font-bold">商品:</p>
                    <ul className="list-disc list-inside ml-4">
                        {order.items.map((item: any) => (
                            <li key={item.item_id} className="text-sm text-gray-700 mb-2">
                                <div className="flex items-center space-x-2">
                                    <img src={item.img} alt={item.item_name} className="w-10 h-10 object-cover rounded" />
                                    <span className="truncate" style={{ maxWidth: '8rem' }}>{item.item_name}</span>
                                    <span>- {item.quantity} x ${item.price.toFixed(2)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {order.note && (
                    <p className="text-sm text-gray-700 font-bold">備註: {order.note}</p>
                )}
            </CardContent>
            <CardFooter className="bg-gray-100 p-4 rounded-b-md flex justify-between">
                <p className="text-sm text-gray-700 font-bold">訂單狀態: {order.order_status}</p>
                <p className="text-sm text-gray-700 font-bold">總價格: ${order.total_price.toFixed(2)}</p>
            </CardFooter>
        </Card>
    );
};

export default OrderCard;

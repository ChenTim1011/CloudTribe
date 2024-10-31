import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Represents a simplified order card for buyers.
 */
const BuyerOrderCard: React.FC<{
  order: any; // The order object
}> = ({ order }) => {
  console.log('BuyerOrderCard received order:', order);

  return (
    <Card className="max-w-md mx-auto my-6 shadow-lg">
      <CardHeader className="bg-black text-white p-4 rounded-t-md flex justify-between">
        <div>
          <CardTitle className="text-lg font-bold">我的訂單</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-sm text-gray-700 font-bold">日期: {order.date}</p>
          <p className="text-sm text-gray-700 font-bold">時間: {order.time}</p>
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

export default BuyerOrderCard;
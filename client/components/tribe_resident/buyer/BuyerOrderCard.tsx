"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from '@/interfaces/tribe_resident/buyer/order';

/**
 * A functional component that displays a simplified order card for buyers.
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.order - The order object containing details such as date, time, location, items, and order status.
 */
const BuyerOrderCard: React.FC<{
  order: Order; // The order object
}> = ({ order }) => {
  
  // Function to determine the correct image source based on category and URL
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
    <Card className="max-w-md mx-auto my-6 shadow-lg">
      {/* Header of the card displaying the order title */}
      <CardHeader className="bg-black text-white p-4 rounded-t-md flex justify-between">
        <div>
          <CardTitle className="text-lg font-bold">我的訂單</CardTitle>
        </div>
      </CardHeader>

      {/* Content section showing order details */}
      <CardContent className="p-4">
        <div className="mb-2">
          {/* Display order date and time */}
          <p className="text-sm text-gray-700 font-bold">送達地點: {order.location}</p>
        </div>
        <div className="mb-2">
          {/* List of items in the order */}
          <p className="text-sm text-gray-700 font-bold">商品:  </p>
          <ul className="list-disc list-inside ml-4">
            {order.items.map((item: any) => (
              <li key={item.item_id} className="text-sm text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  {/* Image of the item */}
                  <img
                    src={getImageSrc(item)}
                    alt={item.item_name || '未命名'}
                    width={40}
                    height={40}
                    className="object-cover rounded"
                  />
                  <div>
                    {/* Display item name, location, and price */}
                    <span className="block font-semibold text-black truncate" style={{ maxWidth: '20rem' }}>
                      {item.item_name || '未命名'}
                    </span>
                    <span className="block font-semibold text-black truncate" style={{ maxWidth: '20rem' }}>
                      地點: {item.location || '未命名'}
                    </span>
                    <span className="block">
                      {item.price} 元 x {item.quantity} = {item.quantity * item.price} 元
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Display order note if present */}
        {order.note && (
          <p className="text-sm text-gray-700 font-bold">備註: {order.note}</p>
        )}
      </CardContent>

      {/* Footer section showing order status and total price */}
      <CardFooter className="bg-gray-100 p-4 rounded-b-md flex justify-between items-center">
        <div className="flex flex-col items-start">
          <p className="text-sm text-gray-700 font-bold">訂單狀態: {order.order_status}</p>
          <p className="text-sm text-gray-700 font-bold">總價格: {order.total_price} 元</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BuyerOrderCard;

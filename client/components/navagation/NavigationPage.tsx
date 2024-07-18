// src/components/navagation/NavigationPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Button } from "@/components/ui/button";
import MapComponent from "@/components/navagation/MapComponent";

const NavigationPage: React.FC = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderData(orderId);
    }
  }, [orderId]);

  const fetchOrderData = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order data');
      }
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  const render = (status: Status) => (<h1>{status}</h1>);

  if (!orderData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">導航到顧客</h1>
      <div className="mb-4">
        <p className="text-lg font-bold">消費者姓名: {orderData.name}</p>
        <p className="text-lg">電話: {orderData.phone}</p>
        <p className="text-lg">地點: {orderData.location}</p>
        <p className="text-lg">總價格: ${orderData.total_price}</p>
        <p className="text-lg">最晚可接單日期: {orderData.date}</p>
        <p className="text-lg">最晚可接單時間: {orderData.time}</p>
        <ul className="list-disc list-inside ml-4">
          {orderData.items.map((item: any) => (
            <li key={item.item_id} className="text-lg">
              {item.name} - {item.quantity} x ${item.price}
            </li>
          ))}
        </ul>
      </div> 
      <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} render={render}>
        <MapComponent center={{ lat: 4.4333479181711075, lng: -75.21505129646759 }} />
      </Wrapper>
    </div>
  );
};

export default NavigationPage;

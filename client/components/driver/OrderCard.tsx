import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const OrderCard: React.FC<{ order: any }> = ({ order }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{order.order_type}</CardTitle>
                <CardDescription>{order.name}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Phone: {order.phone}</p>
                <p>Date: {order.date}</p>
                <p>Time: {order.time}</p>
                <p>Location: {order.location}</p>
                <p>Total Price: {order.total_price}</p>
                <p>Items:</p>
                <ul>
                    {order.items.map((item: any) => (
                        <li key={item.id}>{item.name} - {item.quantity} x ${item.price}</li>
                    ))}
                </ul>
                <p>Note: {order.note}</p>
            </CardContent>
            <CardFooter>
                <p>Order Status: {order.order_status}</p>
            </CardFooter>
        </Card>
    );
};

export default OrderCard;

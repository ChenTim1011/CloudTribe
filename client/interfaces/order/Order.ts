// @/interfaces/order/Order.ts

import { OrderItem } from './OrderItem';

export interface Order {
    id?: number;
    buyer_id: number;
    buyer_name: string;
    //buyer_phone: string;
    //seller_id: number;
    //seller_name: string;
    //seller_phone: string;
    //date: string; // ISO format date, e.g. '2024-05-01'
    //time: string; // ISO format time, e.g. '09:00'
    location: string;
    is_urgent: boolean;
    total_price: number;
    order_type: string; // default value is '購買類'
    order_status: string; // default value is '未接單'
    note?: string;
    //shipment_count?: number; // default value is 1
    //required_orders_count?: number; // default value is 1
    //previous_driver_id?: number;
    //previous_driver_name?: string;
    //previous_driver_phone?: string;
    items: OrderItem[];
}

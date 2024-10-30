// @/interfaces/order/Order.ts

import { OrderItem } from './OrderItem';

export interface Order {
    id?: number;
    buyer_id: number;
    buyer_name: string;
    buyer_phone: string;
    seller_id: number;
    seller_name: string;
    seller_phone: string;
    date: string; // ISO 格式日期，例如 '2024-05-01'
    time: string; // ISO 格式時間，例如 '09:00'
    location: string;
    is_urgent: boolean;
    total_price: number;
    order_type: string; // 預設值為 '購買類'
    order_status: string; // 預設值為 '未接單'
    note?: string;
    shipment_count?: number; // 預設值為 1
    required_orders_count?: number; // 默認值為 1
    previous_driver_id?: number;
    previous_driver_name?: string;
    previous_driver_phone?: string;
    items: OrderItem[];
}

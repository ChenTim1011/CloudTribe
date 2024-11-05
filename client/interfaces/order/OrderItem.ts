// @/interfaces/order/OrderItem.ts

export interface OrderItem {
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
    img: string;
    location?: string; // 預設值為 '家樂福'
    category?: string; // 預設值為 '未分類'
}

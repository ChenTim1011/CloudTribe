// @/interfaces/order/OrderItem.ts

export interface OrderItem {
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
    img: string;
    location?: string; 
    category?: string;
}

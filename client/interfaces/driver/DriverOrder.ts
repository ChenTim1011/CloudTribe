// @/interfaces/driver/DriverOrder.ts

export interface DriverOrder {
    driver_id: number;
    order_id: number;
    action: string;
    timestamp?: string; // ISO 格式日期時間，例如 '2024-05-01T09:00:00Z'
    previous_driver_id?: number;
    previous_driver_name?: string;
    previous_driver_phone?: string;
}

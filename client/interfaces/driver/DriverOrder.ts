// @/interfaces/driver/DriverOrder.ts

export interface DriverOrder {
    driver_id: number;
    order_id: number;
    action: string;
    timestamp?: string; // ISO format date, e.g. '2024-05-01'
    previous_driver_id?: number;
    previous_driver_name?: string;
    previous_driver_phone?: string;
}

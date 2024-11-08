// @/interfaces/driver/Driver.ts

export interface Driver {
    id: number;
    user_id: number;
    driver_name: string;
    driver_phone: string;
    direction?: string;
    available_date?: string; // ISO format date, e.g. '2024-05-01'
    start_time?: string; // ISO format time, e.g. '09:00'
    end_time?: string; // ISO format time, e.g. '09:00'
}

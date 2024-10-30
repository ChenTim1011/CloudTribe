// @/interfaces/driver/Driver.ts

export interface Driver {
    id: number;
    user_id: number;
    driver_name: string;
    driver_phone: string;
    direction?: string;
    available_date?: string; // ISO 格式日期，例如 '2024-05-01'
    start_time?: string; // ISO 格式時間，例如 '09:00'
    end_time?: string; // ISO 格式時間，例如 '18:00'
}

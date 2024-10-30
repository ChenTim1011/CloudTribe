// @/interfaces/driver/DriverTime.ts

export interface DriverTime {
    driver_id: number;
    date: string; // ISO 格式日期，例如 '2024-05-01'
    start_time: string; // ISO 格式時間，例如 '09:00'
    locations: string;
}

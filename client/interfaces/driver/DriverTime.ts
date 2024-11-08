// @/interfaces/driver/DriverTime.ts

export interface DriverTime {
    driver_id: number;
    date: string; // ISO format date, e.g. '2024-05-01'
    start_time: string; // ISO formate time, e.g. '09:00'
    locations: string;
}
